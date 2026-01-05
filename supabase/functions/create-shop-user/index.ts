import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateShopUserRequest {
  email: string
  password: string
  first_name: string
  last_name: string
  role: 'technician' | 'user' | 'workshop_manager'
  phone?: string
  cell_number?: string
  job_role?: string
  department?: string
  pin?: string
  branch_id?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('No authorization header provided')
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create anon client for auth check
    const anonClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Service role client for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify the caller
    const { data: { user: caller }, error: userError } = await anonClient.auth.getUser()
    if (userError || !caller) {
      console.error('Unauthorized:', userError?.message)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Caller verified:', caller.id)

    // Check if caller has permission to create users (workshop_manager, admin, manager, or super_admin)
    const { data: callerRoles, error: rolesError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)

    if (rolesError) {
      console.error('Error fetching caller roles:', rolesError)
      return new Response(
        JSON.stringify({ error: 'Failed to verify permissions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const allowedRoles = ['workshop_manager', 'admin', 'manager', 'super_admin']
    const hasPermission = callerRoles?.some(r => allowedRoles.includes(r.role))

    if (!hasPermission) {
      console.error('User does not have permission to create shop users')
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions. Must be workshop_manager, admin, manager, or super_admin.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get caller's tenant_id
    const { data: callerProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('tenant_id, organization_id')
      .eq('user_id', caller.id)
      .single()

    if (profileError || !callerProfile?.tenant_id) {
      console.error('Error fetching caller profile:', profileError)
      return new Response(
        JSON.stringify({ error: 'Caller must belong to a tenant' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Caller tenant:', callerProfile.tenant_id)

    // Parse request body
    const body: CreateShopUserRequest = await req.json()
    const { email, password, first_name, last_name, role, phone, cell_number, job_role, department, pin, branch_id } = body

    if (!email || !password || !first_name || !last_name || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, password, first_name, last_name, role' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate role
    const validRoles = ['technician', 'user', 'workshop_manager']
    if (!validRoles.includes(role)) {
      return new Response(
        JSON.stringify({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Creating user:', email, 'with role:', role)

    // Create the user in auth.users
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name,
        last_name,
      }
    })

    if (createError) {
      console.error('Error creating user:', createError)
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('User created in auth:', newUser.user.id)

    // Create profile for the new user
    const { error: profileInsertError } = await supabaseAdmin
      .from('profiles')
      .insert({
        user_id: newUser.user.id,
        email,
        first_name,
        last_name,
        phone,
        cell_number,
        job_role,
        department,
        pin,
        branch_id,
        tenant_id: callerProfile.tenant_id,
        organization_id: callerProfile.organization_id,
        is_active: true,
      })

    if (profileInsertError) {
      console.error('Error creating profile:', profileInsertError)
      // Try to clean up the auth user
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
      return new Response(
        JSON.stringify({ error: 'Failed to create user profile' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Profile created for user:', newUser.user.id)

    // Assign role to user
    const { error: roleInsertError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role,
        tenant_id: callerProfile.tenant_id,
        organization_id: callerProfile.organization_id,
      })

    if (roleInsertError) {
      console.error('Error assigning role:', roleInsertError)
      // Clean up
      await supabaseAdmin.from('profiles').delete().eq('user_id', newUser.user.id)
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
      return new Response(
        JSON.stringify({ error: 'Failed to assign user role' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Role assigned to user:', newUser.user.id, 'role:', role)

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          first_name,
          last_name,
          role,
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

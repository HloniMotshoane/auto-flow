import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token) {
      console.log("No token provided");
      return new Response(
        JSON.stringify({ error: "Invalid portal link" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role for public access
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Looking up portal token:", token.substring(0, 10) + "...");

    // Find the portal token
    const { data: tokenData, error: tokenError } = await supabase
      .from("customer_portal_tokens")
      .select("*")
      .eq("token", token)
      .eq("is_active", true)
      .single();

    if (tokenError || !tokenData) {
      console.log("Token not found or inactive:", tokenError?.message);
      return new Response(
        JSON.stringify({ error: "Invalid or expired portal link" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      console.log("Token expired");
      return new Response(
        JSON.stringify({ error: "This portal link has expired. Please request a new one." }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update last accessed timestamp
    await supabase
      .from("customer_portal_tokens")
      .update({ last_accessed_at: new Date().toISOString() })
      .eq("id", tokenData.id);

    // Fetch case details
    const { data: caseData, error: caseError } = await supabase
      .from("cases")
      .select(`
        case_number,
        status,
        created_at,
        notes,
        current_stage:workflow_stages(name, description),
        vehicle:vehicles(registration, make, model, color, year),
        customer:customers(name, email, phone)
      `)
      .eq("id", tokenData.case_id)
      .single();

    if (caseError || !caseData) {
      console.log("Case not found:", caseError?.message);
      return new Response(
        JSON.stringify({ error: "Case information not available" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch job booking for ECD
    const { data: bookingData } = await supabase
      .from("job_bookings")
      .select("estimated_completion_date, status")
      .eq("case_id", tokenData.case_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    // Fetch stage history
    const { data: stageHistory } = await supabase
      .from("stage_history")
      .select(`
        id,
        entered_at,
        completed_at,
        stage:workflow_stages(name)
      `)
      .eq("case_id", tokenData.case_id)
      .order("entered_at", { ascending: true });

    // Fetch tenant details
    const { data: tenantData } = await supabase
      .from("tenants")
      .select("name, phone, email, address")
      .eq("id", tokenData.tenant_id)
      .single();

    // Format stage history
    const formattedHistory = (stageHistory || []).map((h: any) => ({
      id: h.id,
      stage_name: h.stage?.name || "Unknown Stage",
      entered_at: h.entered_at,
      completed_at: h.completed_at,
    }));

    const response = {
      case: {
        case_number: caseData.case_number,
        status: caseData.status,
        created_at: caseData.created_at,
        notes: caseData.notes,
        current_stage: caseData.current_stage,
      },
      vehicle: caseData.vehicle ? {
        registration_number: (caseData.vehicle as any).registration || "N/A",
        make: (caseData.vehicle as any).make || "Unknown",
        model: (caseData.vehicle as any).model || "Unknown",
        color: (caseData.vehicle as any).color || "Unknown",
        year: (caseData.vehicle as any).year || 0,
      } : {
        registration_number: "N/A",
        make: "Unknown",
        model: "Unknown",
        color: "Unknown",
        year: 0,
      },
      customer: caseData.customer || {
        name: "Customer",
        email: "",
        phone: "",
      },
      booking: bookingData,
      stageHistory: formattedHistory,
      tenant: tenantData || {
        name: "Repair Shop",
        phone: "",
        email: "",
        address: "",
      },
    };

    console.log("Portal data fetched successfully for case:", caseData.case_number);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Portal error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred loading your repair status" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

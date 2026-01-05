-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can view roles in their organization" ON public.user_roles;

-- Create new policy that allows users to view their own roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
TO authenticated 
USING (
  user_id = auth.uid() 
  OR 
  organization_id IN (SELECT organization_id FROM public.profiles WHERE user_id = auth.uid())
);
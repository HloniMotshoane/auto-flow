
-- Create visit_requests table for online customer visit/quote requests
CREATE TABLE public.visit_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  request_number text NOT NULL,
  
  -- Customer Info
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  email text,
  id_number text,
  
  -- Request Type
  request_type text NOT NULL DEFAULT 'quote_request',
  
  -- Vehicle (optional)
  vehicle_registration text,
  vehicle_make text,
  vehicle_model text,
  vehicle_year text,
  vehicle_color text,
  damage_description text,
  
  -- Scheduling
  preferred_date date,
  preferred_time_slot text,
  
  -- Details
  message text,
  
  -- Status & Admin
  status text DEFAULT 'pending',
  admin_notes text,
  handled_by uuid,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.visit_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public can insert (for the form submission)
CREATE POLICY "Anyone can create visit requests"
ON public.visit_requests
FOR INSERT
WITH CHECK (true);

-- Staff can view requests in their tenant
CREATE POLICY "Users can view visit requests in their tenant"
ON public.visit_requests
FOR SELECT
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

-- Staff can update requests in their tenant
CREATE POLICY "Users can update visit requests in their tenant"
ON public.visit_requests
FOR UPDATE
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

-- Staff can delete requests in their tenant
CREATE POLICY "Users can delete visit requests in their tenant"
ON public.visit_requests
FOR DELETE
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

-- Create function to generate visit request number
CREATE OR REPLACE FUNCTION public.generate_visit_request_number(p_tenant_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO v_count 
  FROM public.visit_requests 
  WHERE tenant_id = p_tenant_id;
  
  RETURN 'VR' || TO_CHAR(NOW(), 'YYMMDD') || '-' || LPAD(v_count::TEXT, 4, '0');
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_visit_requests_updated_at
BEFORE UPDATE ON public.visit_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_visit_requests_tenant_id ON public.visit_requests(tenant_id);
CREATE INDEX idx_visit_requests_status ON public.visit_requests(status);
CREATE INDEX idx_visit_requests_created_at ON public.visit_requests(created_at DESC);

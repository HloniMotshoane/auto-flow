-- Create visit categories table (configurable by management)
CREATE TABLE public.visit_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  requires_vehicle BOOLEAN DEFAULT false,
  requires_company BOOLEAN DEFAULT false,
  requires_host BOOLEAN DEFAULT false,
  dynamic_fields JSONB DEFAULT '[]'::jsonb,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create visitors table
CREATE TABLE public.visitors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  visitor_number TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  id_passport TEXT,
  phone TEXT,
  email TEXT,
  company TEXT,
  visit_category_id UUID REFERENCES public.visit_categories(id),
  visit_type TEXT NOT NULL,
  purpose_details TEXT,
  host_staff_id UUID,
  host_staff_name TEXT,
  host_department TEXT,
  vehicle_registration TEXT,
  vehicle_make TEXT,
  vehicle_model TEXT,
  vehicle_color TEXT,
  vehicle_reason TEXT,
  signature_data TEXT,
  timestamp_in TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  timestamp_out TIMESTAMP WITH TIME ZONE,
  tablet_id TEXT,
  linked_case_id UUID REFERENCES public.cases(id),
  linked_quotation_id UUID REFERENCES public.quotations(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.visit_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;

-- RLS policies for visit_categories
CREATE POLICY "Users can view visit_categories in their tenant"
  ON public.visit_categories FOR SELECT
  USING (tenant_id = get_user_tenant_id(auth.uid()) OR is_super_admin(auth.uid()));

CREATE POLICY "Admins can create visit_categories in their tenant"
  ON public.visit_categories FOR INSERT
  WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid()) AND is_tenant_admin(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Admins can update visit_categories in their tenant"
  ON public.visit_categories FOR UPDATE
  USING ((tenant_id = get_user_tenant_id(auth.uid()) AND is_tenant_admin(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Admins can delete visit_categories in their tenant"
  ON public.visit_categories FOR DELETE
  USING ((tenant_id = get_user_tenant_id(auth.uid()) AND is_tenant_admin(auth.uid())) OR is_super_admin(auth.uid()));

-- RLS policies for visitors (allow anonymous insert for tablet)
CREATE POLICY "Anyone can create visitors"
  ON public.visitors FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view visitors in their tenant"
  ON public.visitors FOR SELECT
  USING (tenant_id = get_user_tenant_id(auth.uid()) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update visitors in their tenant"
  ON public.visitors FOR UPDATE
  USING (tenant_id = get_user_tenant_id(auth.uid()) OR is_super_admin(auth.uid()));

CREATE POLICY "Admins can delete visitors in their tenant"
  ON public.visitors FOR DELETE
  USING ((tenant_id = get_user_tenant_id(auth.uid()) AND is_tenant_admin(auth.uid())) OR is_super_admin(auth.uid()));

-- Function to generate visitor number
CREATE OR REPLACE FUNCTION public.generate_visitor_number(p_tenant_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO v_count 
  FROM public.visitors 
  WHERE tenant_id = p_tenant_id;
  
  RETURN 'VIS' || LPAD(v_count::TEXT, 4, '0');
END;
$function$;

-- Trigger for updated_at
CREATE TRIGGER update_visit_categories_updated_at
  BEFORE UPDATE ON public.visit_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_visitors_updated_at
  BEFORE UPDATE ON public.visitors
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default visit categories (will be tenant-specific when created)
-- These will be seeded per tenant when they first access the module
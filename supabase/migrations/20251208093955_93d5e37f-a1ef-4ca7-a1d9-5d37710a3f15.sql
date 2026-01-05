-- Part Categories Table
CREATE TABLE public.part_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6B7280',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.part_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view part_categories in their tenant" ON public.part_categories
  FOR SELECT USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create part_categories in their tenant" ON public.part_categories
  FOR INSERT WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update part_categories in their tenant" ON public.part_categories
  FOR UPDATE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete part_categories in their tenant" ON public.part_categories
  FOR DELETE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE TRIGGER update_part_categories_updated_at
  BEFORE UPDATE ON public.part_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Suppliers Table
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  supplier_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  delivery_time_estimate INTEGER, -- in days
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view suppliers in their tenant" ON public.suppliers
  FOR SELECT USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create suppliers in their tenant" ON public.suppliers
  FOR INSERT WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update suppliers in their tenant" ON public.suppliers
  FOR UPDATE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete suppliers in their tenant" ON public.suppliers
  FOR DELETE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE TRIGGER update_suppliers_updated_at
  BEFORE UPDATE ON public.suppliers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Supplier Parts Table (Parts Catalogue)
CREATE TABLE public.supplier_parts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.part_categories(id) ON DELETE SET NULL,
  part_name TEXT NOT NULL,
  part_number TEXT,
  description TEXT,
  model_compatibility TEXT, -- e.g., "VW Polo Vivo 2018-2024"
  list_price NUMERIC DEFAULT 0,
  stock_available INTEGER,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.supplier_parts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view supplier_parts in their tenant" ON public.supplier_parts
  FOR SELECT USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create supplier_parts in their tenant" ON public.supplier_parts
  FOR INSERT WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update supplier_parts in their tenant" ON public.supplier_parts
  FOR UPDATE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete supplier_parts in their tenant" ON public.supplier_parts
  FOR DELETE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE TRIGGER update_supplier_parts_updated_at
  BEFORE UPDATE ON public.supplier_parts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Case Parts Required (Technician Part Requests)
CREATE TABLE public.case_parts_required (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  segment_id UUID REFERENCES public.workshop_segments(id) ON DELETE SET NULL,
  requested_by UUID NOT NULL,
  part_description TEXT NOT NULL,
  reason TEXT, -- "damaged", "missing", "worn out"
  urgency TEXT DEFAULT 'medium', -- "low", "medium", "high", "critical"
  images JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'pending', -- "pending", "quoted", "ordered", "received", "fitted", "cancelled"
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.case_parts_required ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view case_parts_required in their tenant" ON public.case_parts_required
  FOR SELECT USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create case_parts_required in their tenant" ON public.case_parts_required
  FOR INSERT WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update case_parts_required in their tenant" ON public.case_parts_required
  FOR UPDATE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete case_parts_required in their tenant" ON public.case_parts_required
  FOR DELETE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE TRIGGER update_case_parts_required_updated_at
  BEFORE UPDATE ON public.case_parts_required
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Parts Costing Requests
CREATE TABLE public.parts_costing_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  part_required_id UUID REFERENCES public.case_parts_required(id) ON DELETE SET NULL,
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  supplier_part_id UUID REFERENCES public.supplier_parts(id) ON DELETE SET NULL,
  part_description TEXT, -- custom part description if not in catalogue
  quantity INTEGER DEFAULT 1,
  requested_by UUID NOT NULL,
  status TEXT DEFAULT 'pending', -- "pending", "sent", "received", "declined", "expired"
  sent_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.parts_costing_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view parts_costing_requests in their tenant" ON public.parts_costing_requests
  FOR SELECT USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create parts_costing_requests in their tenant" ON public.parts_costing_requests
  FOR INSERT WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update parts_costing_requests in their tenant" ON public.parts_costing_requests
  FOR UPDATE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete parts_costing_requests in their tenant" ON public.parts_costing_requests
  FOR DELETE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE TRIGGER update_parts_costing_requests_updated_at
  BEFORE UPDATE ON public.parts_costing_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Supplier Responses
CREATE TABLE public.supplier_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  costing_request_id UUID NOT NULL REFERENCES public.parts_costing_requests(id) ON DELETE CASCADE,
  quoted_price NUMERIC NOT NULL,
  availability TEXT, -- "in_stock", "out_of_stock", "back_order", "special_order"
  delivery_eta_days INTEGER,
  notes TEXT,
  attachments JSONB DEFAULT '[]'::jsonb,
  responded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.supplier_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage supplier_responses via costing request" ON public.supplier_responses
  FOR ALL USING (
    costing_request_id IN (
      SELECT id FROM public.parts_costing_requests 
      WHERE (tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid())
    )
  );

-- Case Parts Used (Fitted Parts)
CREATE TABLE public.case_parts_used (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  supplier_part_id UUID REFERENCES public.supplier_parts(id) ON DELETE SET NULL,
  costing_request_id UUID REFERENCES public.parts_costing_requests(id) ON DELETE SET NULL,
  part_required_id UUID REFERENCES public.case_parts_required(id) ON DELETE SET NULL,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  part_description TEXT, -- for custom parts not in catalogue
  quantity INTEGER DEFAULT 1,
  cost_paid NUMERIC DEFAULT 0,
  fitted_by UUID,
  segment_id UUID REFERENCES public.workshop_segments(id) ON DELETE SET NULL,
  fitted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.case_parts_used ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view case_parts_used in their tenant" ON public.case_parts_used
  FOR SELECT USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create case_parts_used in their tenant" ON public.case_parts_used
  FOR INSERT WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update case_parts_used in their tenant" ON public.case_parts_used
  FOR UPDATE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete case_parts_used in their tenant" ON public.case_parts_used
  FOR DELETE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE TRIGGER update_case_parts_used_updated_at
  BEFORE UPDATE ON public.case_parts_used
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better query performance
CREATE INDEX idx_suppliers_tenant ON public.suppliers(tenant_id);
CREATE INDEX idx_supplier_parts_supplier ON public.supplier_parts(supplier_id);
CREATE INDEX idx_supplier_parts_category ON public.supplier_parts(category_id);
CREATE INDEX idx_case_parts_required_case ON public.case_parts_required(case_id);
CREATE INDEX idx_parts_costing_requests_case ON public.parts_costing_requests(case_id);
CREATE INDEX idx_parts_costing_requests_supplier ON public.parts_costing_requests(supplier_id);
CREATE INDEX idx_supplier_responses_request ON public.supplier_responses(costing_request_id);
CREATE INDEX idx_case_parts_used_case ON public.case_parts_used(case_id);
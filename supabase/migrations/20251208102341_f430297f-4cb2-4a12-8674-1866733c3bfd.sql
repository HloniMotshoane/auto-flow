-- Create parts_orders table for full order lifecycle tracking
CREATE TABLE public.parts_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  case_id UUID NOT NULL REFERENCES public.cases(id),
  supplier_id UUID NOT NULL REFERENCES public.suppliers(id),
  supplier_part_id UUID REFERENCES public.supplier_parts(id),
  costing_request_id UUID REFERENCES public.parts_costing_requests(id),
  part_required_id UUID REFERENCES public.case_parts_required(id),
  part_description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  ordered_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expected_delivery_date DATE,
  delivered_date TIMESTAMP WITH TIME ZONE,
  fitted_date TIMESTAMP WITH TIME ZONE,
  fitted_by UUID,
  status TEXT NOT NULL DEFAULT 'ordered',
  order_reference TEXT,
  invoice_number TEXT,
  cost_quoted NUMERIC DEFAULT 0,
  cost_actual NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add segment_id and technician_id to case_consumables for tracking
ALTER TABLE public.case_consumables 
ADD COLUMN IF NOT EXISTS segment_id UUID REFERENCES public.workshop_segments(id),
ADD COLUMN IF NOT EXISTS technician_id UUID;

-- Enable RLS on parts_orders
ALTER TABLE public.parts_orders ENABLE ROW LEVEL SECURITY;

-- RLS policies for parts_orders
CREATE POLICY "Users can view parts_orders in their tenant"
  ON public.parts_orders FOR SELECT
  USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create parts_orders in their tenant"
  ON public.parts_orders FOR INSERT
  WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update parts_orders in their tenant"
  ON public.parts_orders FOR UPDATE
  USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete parts_orders in their tenant"
  ON public.parts_orders FOR DELETE
  USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

-- Add index for common queries
CREATE INDEX idx_parts_orders_case_id ON public.parts_orders(case_id);
CREATE INDEX idx_parts_orders_status ON public.parts_orders(status);
CREATE INDEX idx_parts_orders_tenant_id ON public.parts_orders(tenant_id);
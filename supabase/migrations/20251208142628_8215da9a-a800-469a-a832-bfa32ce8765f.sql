-- Payments table for reception payment processing
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'eft', 'cash', 'cheque')),
  payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reference_number TEXT,
  receipt_number TEXT,
  received_by UUID,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Release reports table for vehicle release workflow
CREATE TABLE public.release_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  report_number TEXT NOT NULL,
  payment_verified BOOLEAN NOT NULL DEFAULT FALSE,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  work_summary JSONB DEFAULT '[]'::jsonb,
  parts_summary JSONB DEFAULT '[]'::jsonb,
  consumables_summary JSONB DEFAULT '[]'::jsonb,
  total_labour_cost DECIMAL(12,2) DEFAULT 0,
  total_parts_cost DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) DEFAULT 0,
  amount_paid DECIMAL(12,2) DEFAULT 0,
  outstanding_balance DECIMAL(12,2) DEFAULT 0,
  generated_by UUID,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  released_by UUID,
  released_at TIMESTAMPTZ,
  customer_signature TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ready', 'released', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Leads table for marketing and client management
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  source TEXT,
  lead_type TEXT NOT NULL CHECK (lead_type IN ('client', 'assessor', 'insurance', 'fleet', 'partner', 'other')),
  company_name TEXT,
  contact_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'converted', 'lost')),
  assigned_to UUID,
  converted_to_customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.release_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Payments RLS policies
CREATE POLICY "Users can view payments in their tenant" ON public.payments
  FOR SELECT USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create payments in their tenant" ON public.payments
  FOR INSERT WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update payments in their tenant" ON public.payments
  FOR UPDATE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete payments in their tenant" ON public.payments
  FOR DELETE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

-- Release reports RLS policies
CREATE POLICY "Users can view release_reports in their tenant" ON public.release_reports
  FOR SELECT USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create release_reports in their tenant" ON public.release_reports
  FOR INSERT WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update release_reports in their tenant" ON public.release_reports
  FOR UPDATE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete release_reports in their tenant" ON public.release_reports
  FOR DELETE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

-- Leads RLS policies
CREATE POLICY "Users can view leads in their tenant" ON public.leads
  FOR SELECT USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create leads in their tenant" ON public.leads
  FOR INSERT WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update leads in their tenant" ON public.leads
  FOR UPDATE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete leads in their tenant" ON public.leads
  FOR DELETE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

-- Update triggers
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_release_reports_updated_at BEFORE UPDATE ON public.release_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate release report number
CREATE OR REPLACE FUNCTION public.generate_release_report_number(p_tenant_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO v_count 
  FROM public.release_reports 
  WHERE tenant_id = p_tenant_id;
  
  RETURN 'REL-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || LPAD(v_count::TEXT, 4, '0');
END;
$function$;

-- Function to generate receipt number
CREATE OR REPLACE FUNCTION public.generate_receipt_number(p_tenant_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO v_count 
  FROM public.payments 
  WHERE tenant_id = p_tenant_id;
  
  RETURN 'RCP-' || TO_CHAR(NOW(), 'YYMMDD') || '-' || LPAD(v_count::TEXT, 4, '0');
END;
$function$;
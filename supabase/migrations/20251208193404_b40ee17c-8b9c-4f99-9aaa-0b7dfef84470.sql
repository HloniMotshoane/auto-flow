
-- =============================================
-- PHASE 1: QUALITY CONTROL (QC) SYSTEM TABLES
-- =============================================

-- QC Checklist Templates
CREATE TABLE public.qc_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  checklist_type TEXT NOT NULL DEFAULT 'pre_repair', -- pre_repair, mid_repair, final_qc
  segment_id UUID REFERENCES public.workshop_segments(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  is_required BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- QC Checklist Items
CREATE TABLE public.qc_checklist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id UUID NOT NULL REFERENCES public.qc_checklists(id) ON DELETE CASCADE,
  item_text TEXT NOT NULL,
  description TEXT,
  requires_photo BOOLEAN DEFAULT false,
  requires_notes BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- QC Inspections (completed inspections linked to cases)
CREATE TABLE public.qc_inspections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  checklist_id UUID NOT NULL REFERENCES public.qc_checklists(id) ON DELETE CASCADE,
  inspector_id UUID NOT NULL,
  inspection_type TEXT NOT NULL DEFAULT 'pre_repair',
  status TEXT NOT NULL DEFAULT 'in_progress', -- in_progress, passed, failed, requires_rework
  overall_score NUMERIC,
  total_items INTEGER DEFAULT 0,
  passed_items INTEGER DEFAULT 0,
  failed_items INTEGER DEFAULT 0,
  na_items INTEGER DEFAULT 0,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- QC Inspection Results (individual item results)
CREATE TABLE public.qc_inspection_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  inspection_id UUID NOT NULL REFERENCES public.qc_inspections(id) ON DELETE CASCADE,
  checklist_item_id UUID NOT NULL REFERENCES public.qc_checklist_items(id) ON DELETE CASCADE,
  result TEXT NOT NULL DEFAULT 'pending', -- pending, pass, fail, na
  notes TEXT,
  photos JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- QC Rework Logs
CREATE TABLE public.qc_rework_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  inspection_id UUID REFERENCES public.qc_inspections(id) ON DELETE SET NULL,
  reported_by UUID NOT NULL,
  assigned_to UUID,
  rework_reason TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'minor', -- minor, moderate, major
  estimated_hours NUMERIC,
  actual_hours NUMERIC,
  estimated_cost NUMERIC,
  actual_cost NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, cancelled
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- PHASE 1: SCHEDULING & CAPACITY PLANNING TABLES
-- =============================================

-- Workshop Bays
CREATE TABLE public.workshop_bays (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  bay_type TEXT DEFAULT 'general', -- general, paint, mechanical, electrical, assembly
  segment_id UUID REFERENCES public.workshop_segments(id) ON DELETE SET NULL,
  capacity INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Job Bookings (Scheduled booking slots)
CREATE TABLE public.job_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  bay_id UUID REFERENCES public.workshop_bays(id) ON DELETE SET NULL,
  booking_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  estimated_days INTEGER DEFAULT 1,
  estimated_completion_date DATE,
  actual_completion_date DATE,
  booking_type TEXT DEFAULT 'repair', -- repair, assessment, collection, delivery
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, confirmed, in_progress, completed, cancelled
  priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Technician Schedules
CREATE TABLE public.technician_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  technician_id UUID NOT NULL,
  schedule_date DATE NOT NULL,
  start_time TIME DEFAULT '08:00',
  end_time TIME DEFAULT '17:00',
  schedule_type TEXT DEFAULT 'working', -- working, leave, sick, training, public_holiday
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(technician_id, schedule_date)
);

-- Bay Assignments (Vehicle-to-bay assignments)
CREATE TABLE public.bay_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  bay_id UUID NOT NULL REFERENCES public.workshop_bays(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  assigned_technician_id UUID,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  released_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, transferred
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- PHASE 1: FINANCIAL PROFITABILITY TABLES
-- =============================================

-- Labor Rates
CREATE TABLE public.labor_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  rate_type TEXT DEFAULT 'hourly', -- hourly, fixed, per_panel
  rate_amount NUMERIC NOT NULL DEFAULT 0,
  cost_rate NUMERIC DEFAULT 0, -- internal cost rate
  segment_id UUID REFERENCES public.workshop_segments(id) ON DELETE SET NULL,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Job Costs (Aggregated cost tracking per job)
CREATE TABLE public.job_costs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  quoted_labor NUMERIC DEFAULT 0,
  actual_labor NUMERIC DEFAULT 0,
  quoted_parts NUMERIC DEFAULT 0,
  actual_parts NUMERIC DEFAULT 0,
  quoted_consumables NUMERIC DEFAULT 0,
  actual_consumables NUMERIC DEFAULT 0,
  quoted_sublet NUMERIC DEFAULT 0,
  actual_sublet NUMERIC DEFAULT 0,
  quoted_total NUMERIC DEFAULT 0,
  actual_total NUMERIC DEFAULT 0,
  labor_hours_quoted NUMERIC DEFAULT 0,
  labor_hours_actual NUMERIC DEFAULT 0,
  profit_margin NUMERIC,
  profit_amount NUMERIC,
  is_overbudget BOOLEAN DEFAULT false,
  overbudget_amount NUMERIC DEFAULT 0,
  last_calculated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(case_id)
);

-- Cost Overruns
CREATE TABLE public.cost_overruns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  job_cost_id UUID REFERENCES public.job_costs(id) ON DELETE SET NULL,
  overrun_type TEXT NOT NULL, -- labor, parts, consumables, sublet, total
  quoted_amount NUMERIC NOT NULL,
  actual_amount NUMERIC NOT NULL,
  overrun_amount NUMERIC NOT NULL,
  overrun_percentage NUMERIC,
  reason TEXT,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Supplier Invoices
CREATE TABLE public.supplier_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  parts_order_id UUID REFERENCES public.parts_orders(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  vat_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  amount_paid NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, partial, paid, disputed, cancelled
  payment_date TIMESTAMP WITH TIME ZONE,
  payment_reference TEXT,
  notes TEXT,
  document_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE public.qc_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qc_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qc_inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qc_inspection_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qc_rework_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_bays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technician_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bay_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.labor_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cost_overruns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_invoices ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES FOR QC TABLES
-- =============================================

CREATE POLICY "Users can view qc_checklists in their tenant" ON public.qc_checklists
  FOR SELECT USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create qc_checklists in their tenant" ON public.qc_checklists
  FOR INSERT WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update qc_checklists in their tenant" ON public.qc_checklists
  FOR UPDATE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete qc_checklists in their tenant" ON public.qc_checklists
  FOR DELETE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can manage qc_checklist_items" ON public.qc_checklist_items
  FOR ALL USING (checklist_id IN (SELECT id FROM public.qc_checklists WHERE (tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid())));

CREATE POLICY "Users can view qc_inspections in their tenant" ON public.qc_inspections
  FOR SELECT USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create qc_inspections in their tenant" ON public.qc_inspections
  FOR INSERT WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update qc_inspections in their tenant" ON public.qc_inspections
  FOR UPDATE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete qc_inspections in their tenant" ON public.qc_inspections
  FOR DELETE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can manage qc_inspection_results" ON public.qc_inspection_results
  FOR ALL USING (inspection_id IN (SELECT id FROM public.qc_inspections WHERE (tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid())));

CREATE POLICY "Users can view qc_rework_logs in their tenant" ON public.qc_rework_logs
  FOR SELECT USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create qc_rework_logs in their tenant" ON public.qc_rework_logs
  FOR INSERT WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update qc_rework_logs in their tenant" ON public.qc_rework_logs
  FOR UPDATE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete qc_rework_logs in their tenant" ON public.qc_rework_logs
  FOR DELETE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

-- =============================================
-- RLS POLICIES FOR SCHEDULING TABLES
-- =============================================

CREATE POLICY "Users can view workshop_bays in their tenant" ON public.workshop_bays
  FOR SELECT USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create workshop_bays in their tenant" ON public.workshop_bays
  FOR INSERT WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update workshop_bays in their tenant" ON public.workshop_bays
  FOR UPDATE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete workshop_bays in their tenant" ON public.workshop_bays
  FOR DELETE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can view job_bookings in their tenant" ON public.job_bookings
  FOR SELECT USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create job_bookings in their tenant" ON public.job_bookings
  FOR INSERT WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update job_bookings in their tenant" ON public.job_bookings
  FOR UPDATE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete job_bookings in their tenant" ON public.job_bookings
  FOR DELETE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can view technician_schedules in their tenant" ON public.technician_schedules
  FOR SELECT USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create technician_schedules in their tenant" ON public.technician_schedules
  FOR INSERT WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update technician_schedules in their tenant" ON public.technician_schedules
  FOR UPDATE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete technician_schedules in their tenant" ON public.technician_schedules
  FOR DELETE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can view bay_assignments in their tenant" ON public.bay_assignments
  FOR SELECT USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create bay_assignments in their tenant" ON public.bay_assignments
  FOR INSERT WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update bay_assignments in their tenant" ON public.bay_assignments
  FOR UPDATE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete bay_assignments in their tenant" ON public.bay_assignments
  FOR DELETE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

-- =============================================
-- RLS POLICIES FOR PROFITABILITY TABLES
-- =============================================

CREATE POLICY "Users can view labor_rates in their tenant" ON public.labor_rates
  FOR SELECT USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create labor_rates in their tenant" ON public.labor_rates
  FOR INSERT WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update labor_rates in their tenant" ON public.labor_rates
  FOR UPDATE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete labor_rates in their tenant" ON public.labor_rates
  FOR DELETE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can view job_costs in their tenant" ON public.job_costs
  FOR SELECT USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create job_costs in their tenant" ON public.job_costs
  FOR INSERT WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update job_costs in their tenant" ON public.job_costs
  FOR UPDATE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete job_costs in their tenant" ON public.job_costs
  FOR DELETE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can view cost_overruns in their tenant" ON public.cost_overruns
  FOR SELECT USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create cost_overruns in their tenant" ON public.cost_overruns
  FOR INSERT WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update cost_overruns in their tenant" ON public.cost_overruns
  FOR UPDATE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete cost_overruns in their tenant" ON public.cost_overruns
  FOR DELETE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can view supplier_invoices in their tenant" ON public.supplier_invoices
  FOR SELECT USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create supplier_invoices in their tenant" ON public.supplier_invoices
  FOR INSERT WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update supplier_invoices in their tenant" ON public.supplier_invoices
  FOR UPDATE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete supplier_invoices in their tenant" ON public.supplier_invoices
  FOR DELETE USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE TRIGGER update_qc_checklists_updated_at BEFORE UPDATE ON public.qc_checklists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_qc_checklist_items_updated_at BEFORE UPDATE ON public.qc_checklist_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_qc_inspections_updated_at BEFORE UPDATE ON public.qc_inspections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_qc_inspection_results_updated_at BEFORE UPDATE ON public.qc_inspection_results FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_qc_rework_logs_updated_at BEFORE UPDATE ON public.qc_rework_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_workshop_bays_updated_at BEFORE UPDATE ON public.workshop_bays FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_job_bookings_updated_at BEFORE UPDATE ON public.job_bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_technician_schedules_updated_at BEFORE UPDATE ON public.technician_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bay_assignments_updated_at BEFORE UPDATE ON public.bay_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_labor_rates_updated_at BEFORE UPDATE ON public.labor_rates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_job_costs_updated_at BEFORE UPDATE ON public.job_costs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cost_overruns_updated_at BEFORE UPDATE ON public.cost_overruns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_supplier_invoices_updated_at BEFORE UPDATE ON public.supplier_invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

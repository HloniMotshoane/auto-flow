
-- Create helper function to check if user is workshop manager
CREATE OR REPLACE FUNCTION public.is_workshop_manager(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('workshop_manager'::app_role, 'admin'::app_role)
  )
$$;

-- Create helper function to check if user is technician
CREATE OR REPLACE FUNCTION public.is_technician(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'technician'::app_role
  )
$$;

-- Phase 1: Create workshop_segments table
CREATE TABLE public.workshop_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  segment_name text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  color text DEFAULT '#6B7280',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.workshop_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view segments in their tenant"
ON public.workshop_segments FOR SELECT
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Workshop managers can create segments"
ON public.workshop_segments FOR INSERT
WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) AND (is_workshop_manager(auth.uid()) OR is_tenant_admin(auth.uid()) OR is_super_admin(auth.uid())));

CREATE POLICY "Workshop managers can update segments"
ON public.workshop_segments FOR UPDATE
USING ((tenant_id = get_user_tenant_id(auth.uid())) AND (is_workshop_manager(auth.uid()) OR is_tenant_admin(auth.uid()) OR is_super_admin(auth.uid())));

CREATE POLICY "Workshop managers can delete segments"
ON public.workshop_segments FOR DELETE
USING ((tenant_id = get_user_tenant_id(auth.uid())) AND (is_workshop_manager(auth.uid()) OR is_tenant_admin(auth.uid()) OR is_super_admin(auth.uid())));

-- Create segment_tasks table
CREATE TABLE public.segment_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  segment_id uuid NOT NULL REFERENCES public.workshop_segments(id) ON DELETE CASCADE,
  task_name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.segment_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tasks in their tenant"
ON public.segment_tasks FOR SELECT
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Workshop managers can create tasks"
ON public.segment_tasks FOR INSERT
WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) AND (is_workshop_manager(auth.uid()) OR is_tenant_admin(auth.uid()) OR is_super_admin(auth.uid())));

CREATE POLICY "Workshop managers can update tasks"
ON public.segment_tasks FOR UPDATE
USING ((tenant_id = get_user_tenant_id(auth.uid())) AND (is_workshop_manager(auth.uid()) OR is_tenant_admin(auth.uid()) OR is_super_admin(auth.uid())));

CREATE POLICY "Workshop managers can delete tasks"
ON public.segment_tasks FOR DELETE
USING ((tenant_id = get_user_tenant_id(auth.uid())) AND (is_workshop_manager(auth.uid()) OR is_tenant_admin(auth.uid()) OR is_super_admin(auth.uid())));

-- Create tablet_assignments table
CREATE TABLE public.tablet_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  tablet_identifier text NOT NULL,
  segment_id uuid NOT NULL REFERENCES public.workshop_segments(id) ON DELETE CASCADE,
  location_description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, tablet_identifier)
);

ALTER TABLE public.tablet_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tablet assignments in their tenant"
ON public.tablet_assignments FOR SELECT
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Workshop managers can create tablet assignments"
ON public.tablet_assignments FOR INSERT
WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) AND (is_workshop_manager(auth.uid()) OR is_tenant_admin(auth.uid()) OR is_super_admin(auth.uid())));

CREATE POLICY "Workshop managers can update tablet assignments"
ON public.tablet_assignments FOR UPDATE
USING ((tenant_id = get_user_tenant_id(auth.uid())) AND (is_workshop_manager(auth.uid()) OR is_tenant_admin(auth.uid()) OR is_super_admin(auth.uid())));

CREATE POLICY "Workshop managers can delete tablet assignments"
ON public.tablet_assignments FOR DELETE
USING ((tenant_id = get_user_tenant_id(auth.uid())) AND (is_workshop_manager(auth.uid()) OR is_tenant_admin(auth.uid()) OR is_super_admin(auth.uid())));

-- Create tablet_users table
CREATE TABLE public.tablet_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tablet_assignment_id uuid NOT NULL REFERENCES public.tablet_assignments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(tablet_assignment_id, user_id)
);

ALTER TABLE public.tablet_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tablet users in their tenant"
ON public.tablet_users FOR SELECT
USING (
  tablet_assignment_id IN (
    SELECT id FROM public.tablet_assignments 
    WHERE tenant_id = get_user_tenant_id(auth.uid())
  ) OR is_super_admin(auth.uid())
);

CREATE POLICY "Workshop managers can create tablet users"
ON public.tablet_users FOR INSERT
WITH CHECK (
  tablet_assignment_id IN (
    SELECT id FROM public.tablet_assignments 
    WHERE tenant_id = get_user_tenant_id(auth.uid())
  ) AND (is_workshop_manager(auth.uid()) OR is_tenant_admin(auth.uid()) OR is_super_admin(auth.uid()))
);

CREATE POLICY "Workshop managers can delete tablet users"
ON public.tablet_users FOR DELETE
USING (
  tablet_assignment_id IN (
    SELECT id FROM public.tablet_assignments 
    WHERE tenant_id = get_user_tenant_id(auth.uid())
  ) AND (is_workshop_manager(auth.uid()) OR is_tenant_admin(auth.uid()) OR is_super_admin(auth.uid()))
);

-- Create activity_logs table
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  segment_id uuid NOT NULL REFERENCES public.workshop_segments(id) ON DELETE RESTRICT,
  task_id uuid REFERENCES public.segment_tasks(id) ON DELETE SET NULL,
  technician_id uuid NOT NULL,
  start_time timestamp with time zone NOT NULL DEFAULT now(),
  stop_time timestamp with time zone,
  duration_minutes integer,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view activity logs in their tenant"
ON public.activity_logs FOR SELECT
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Technicians and managers can create activity logs"
ON public.activity_logs FOR INSERT
WITH CHECK (
  (tenant_id = get_user_tenant_id(auth.uid())) AND 
  (is_technician(auth.uid()) OR is_workshop_manager(auth.uid()) OR is_tenant_admin(auth.uid()) OR is_super_admin(auth.uid()))
);

CREATE POLICY "Technicians can update their own activity logs"
ON public.activity_logs FOR UPDATE
USING (
  (tenant_id = get_user_tenant_id(auth.uid())) AND 
  (technician_id = auth.uid() OR is_workshop_manager(auth.uid()) OR is_tenant_admin(auth.uid()) OR is_super_admin(auth.uid()))
);

CREATE POLICY "Workshop managers can delete activity logs"
ON public.activity_logs FOR DELETE
USING ((tenant_id = get_user_tenant_id(auth.uid())) AND (is_workshop_manager(auth.uid()) OR is_tenant_admin(auth.uid()) OR is_super_admin(auth.uid())));

-- Create workshop_reports table
CREATE TABLE public.workshop_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  case_id uuid NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  closed_at timestamp with time zone NOT NULL DEFAULT now(),
  closed_by uuid NOT NULL,
  manager_notes text,
  final_status text NOT NULL DEFAULT 'completed',
  report_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(case_id)
);

ALTER TABLE public.workshop_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view workshop reports in their tenant"
ON public.workshop_reports FOR SELECT
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Workshop managers can create workshop reports"
ON public.workshop_reports FOR INSERT
WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) AND (is_workshop_manager(auth.uid()) OR is_tenant_admin(auth.uid()) OR is_super_admin(auth.uid())));

CREATE POLICY "Workshop managers can update workshop reports"
ON public.workshop_reports FOR UPDATE
USING ((tenant_id = get_user_tenant_id(auth.uid())) AND (is_workshop_manager(auth.uid()) OR is_tenant_admin(auth.uid()) OR is_super_admin(auth.uid())));

-- Add triggers for updated_at
CREATE TRIGGER update_workshop_segments_updated_at
BEFORE UPDATE ON public.workshop_segments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_segment_tasks_updated_at
BEFORE UPDATE ON public.segment_tasks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tablet_assignments_updated_at
BEFORE UPDATE ON public.tablet_assignments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_activity_logs_updated_at
BEFORE UPDATE ON public.activity_logs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workshop_reports_updated_at
BEFORE UPDATE ON public.workshop_reports
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_workshop_segments_tenant ON public.workshop_segments(tenant_id);
CREATE INDEX idx_segment_tasks_segment ON public.segment_tasks(segment_id);
CREATE INDEX idx_tablet_assignments_segment ON public.tablet_assignments(segment_id);
CREATE INDEX idx_activity_logs_case ON public.activity_logs(case_id);
CREATE INDEX idx_activity_logs_technician ON public.activity_logs(technician_id);
CREATE INDEX idx_activity_logs_segment ON public.activity_logs(segment_id);
CREATE INDEX idx_workshop_reports_case ON public.workshop_reports(case_id);

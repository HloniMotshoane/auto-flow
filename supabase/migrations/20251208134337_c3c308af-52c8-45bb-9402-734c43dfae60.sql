-- =============================================
-- JOBS MODULE: Add lifecycle tracking columns
-- =============================================
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS lifecycle_status text DEFAULT 'quote';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS authorization_status text DEFAULT 'pending';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS authorization_date timestamp with time zone;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS vehicle_arrived_at timestamp with time zone;

-- =============================================
-- TABLETS MODULE: Create capabilities table
-- =============================================
CREATE TABLE IF NOT EXISTS public.tablet_capabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  tablet_id uuid NOT NULL REFERENCES public.tablet_assignments(id) ON DELETE CASCADE,
  capability_type text NOT NULL,
  is_enabled boolean DEFAULT true,
  configuration jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tablet_capabilities ENABLE ROW LEVEL SECURITY;

-- RLS policies for tablet_capabilities
CREATE POLICY "Users can view tablet_capabilities in their tenant"
ON public.tablet_capabilities FOR SELECT
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create tablet_capabilities in their tenant"
ON public.tablet_capabilities FOR INSERT
WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update tablet_capabilities in their tenant"
ON public.tablet_capabilities FOR UPDATE
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete tablet_capabilities in their tenant"
ON public.tablet_capabilities FOR DELETE
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

-- =============================================
-- TABLETS MODULE: Create installed apps table
-- =============================================
CREATE TABLE IF NOT EXISTS public.tablet_installed_apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  tablet_id uuid NOT NULL REFERENCES public.tablet_assignments(id) ON DELETE CASCADE,
  app_name text NOT NULL,
  app_description text,
  app_version text,
  is_active boolean DEFAULT true,
  installed_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tablet_installed_apps ENABLE ROW LEVEL SECURITY;

-- RLS policies for tablet_installed_apps
CREATE POLICY "Users can view tablet_installed_apps in their tenant"
ON public.tablet_installed_apps FOR SELECT
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create tablet_installed_apps in their tenant"
ON public.tablet_installed_apps FOR INSERT
WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update tablet_installed_apps in their tenant"
ON public.tablet_installed_apps FOR UPDATE
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete tablet_installed_apps in their tenant"
ON public.tablet_installed_apps FOR DELETE
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tablet_capabilities_tablet_id ON public.tablet_capabilities(tablet_id);
CREATE INDEX IF NOT EXISTS idx_tablet_installed_apps_tablet_id ON public.tablet_installed_apps(tablet_id);
CREATE INDEX IF NOT EXISTS idx_jobs_lifecycle_status ON public.jobs(lifecycle_status);
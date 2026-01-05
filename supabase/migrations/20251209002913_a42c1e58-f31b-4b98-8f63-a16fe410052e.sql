-- Create customer_notifications table for tracking all notifications sent
CREATE TABLE public.customer_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'status_update', 'ecd_update', 'ready_for_collection', 'payment_reminder'
  channel TEXT NOT NULL DEFAULT 'email', -- 'email', 'sms', 'whatsapp'
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed'
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customer_portal_tokens for secure access without login
CREATE TABLE public.customer_portal_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_accessed_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create collection_schedules for booking vehicle pickups
CREATE TABLE public.collection_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  contact_name TEXT,
  contact_phone TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'
  confirmed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification_templates for reusable message templates
CREATE TABLE public.notification_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  notification_type TEXT NOT NULL, -- 'status_update', 'ecd_update', 'ready_for_collection', 'payment_reminder'
  channel TEXT NOT NULL DEFAULT 'email',
  subject_template TEXT,
  body_template TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.customer_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_portal_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for customer_notifications
CREATE POLICY "Users can view notifications in their tenant"
  ON public.customer_notifications FOR SELECT
  USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create notifications in their tenant"
  ON public.customer_notifications FOR INSERT
  WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update notifications in their tenant"
  ON public.customer_notifications FOR UPDATE
  USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete notifications in their tenant"
  ON public.customer_notifications FOR DELETE
  USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

-- RLS Policies for customer_portal_tokens
CREATE POLICY "Users can view portal tokens in their tenant"
  ON public.customer_portal_tokens FOR SELECT
  USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create portal tokens in their tenant"
  ON public.customer_portal_tokens FOR INSERT
  WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update portal tokens in their tenant"
  ON public.customer_portal_tokens FOR UPDATE
  USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete portal tokens in their tenant"
  ON public.customer_portal_tokens FOR DELETE
  USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

-- RLS Policies for collection_schedules
CREATE POLICY "Users can view collection schedules in their tenant"
  ON public.collection_schedules FOR SELECT
  USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create collection schedules in their tenant"
  ON public.collection_schedules FOR INSERT
  WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update collection schedules in their tenant"
  ON public.collection_schedules FOR UPDATE
  USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete collection schedules in their tenant"
  ON public.collection_schedules FOR DELETE
  USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

-- RLS Policies for notification_templates
CREATE POLICY "Users can view notification templates in their tenant"
  ON public.notification_templates FOR SELECT
  USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create notification templates in their tenant"
  ON public.notification_templates FOR INSERT
  WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update notification templates in their tenant"
  ON public.notification_templates FOR UPDATE
  USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete notification templates in their tenant"
  ON public.notification_templates FOR DELETE
  USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_customer_notifications_tenant_id ON public.customer_notifications(tenant_id);
CREATE INDEX idx_customer_notifications_case_id ON public.customer_notifications(case_id);
CREATE INDEX idx_customer_notifications_customer_id ON public.customer_notifications(customer_id);
CREATE INDEX idx_customer_portal_tokens_token ON public.customer_portal_tokens(token);
CREATE INDEX idx_customer_portal_tokens_case_id ON public.customer_portal_tokens(case_id);
CREATE INDEX idx_collection_schedules_tenant_id ON public.collection_schedules(tenant_id);
CREATE INDEX idx_collection_schedules_scheduled_date ON public.collection_schedules(scheduled_date);
CREATE INDEX idx_notification_templates_tenant_id ON public.notification_templates(tenant_id);
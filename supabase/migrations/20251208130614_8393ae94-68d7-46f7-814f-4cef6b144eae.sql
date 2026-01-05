-- Create towing_records table
CREATE TABLE public.towing_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  reference_number text NOT NULL,
  tow_type text NOT NULL CHECK (tow_type IN ('upliftment', 'tow_in', 'accident')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'written_off')),
  
  -- Client Info
  client_first_name text,
  client_last_name text,
  client_phone text,
  client_email text,
  client_type text DEFAULT 'individual' CHECK (client_type IN ('individual', 'corporate')),
  client_id_number text,
  
  -- Vehicle Info
  registration_number text,
  vin text,
  make text,
  model text,
  odometer text,
  engine_size text,
  
  -- Tow & Insurance
  tow_company_id uuid REFERENCES public.suppliers(id),
  insurance_company_id uuid REFERENCES public.insurance_companies(id),
  
  -- Proforma Invoice Fields
  storage_days integer DEFAULT 0,
  admin_days integer DEFAULT 0,
  security_days integer DEFAULT 0,
  car_rate numeric DEFAULT 0,
  truck_rate numeric DEFAULT 0,
  security_rate numeric DEFAULT 0,
  admin_rate numeric DEFAULT 0,
  towing_fee numeric DEFAULT 0,
  release_fee numeric DEFAULT 0,
  discount_percentage numeric DEFAULT 0,
  payment_status text DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid', 'partial')),
  payment_method text,
  invoice_comments text,
  
  -- Internal
  internal_notes text,
  
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create towing_documents table
CREATE TABLE public.towing_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  towing_record_id uuid NOT NULL REFERENCES public.towing_records(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_size integer,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create towing_images table
CREATE TABLE public.towing_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  towing_record_id uuid NOT NULL REFERENCES public.towing_records(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  image_type text NOT NULL CHECK (image_type IN ('car_license', 'client_image', 'tow_slip', 'security_photo', 'tow_image')),
  file_name text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create towing_invoices table (for Tow Cost capture)
CREATE TABLE public.towing_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  towing_record_id uuid NOT NULL REFERENCES public.towing_records(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  invoice_file_url text,
  branch_id uuid REFERENCES public.branches(id),
  destination text,
  vat_type text DEFAULT 'vat' CHECK (vat_type IN ('vat', 'non_vat')),
  supplier_id uuid REFERENCES public.suppliers(id),
  invoice_date date,
  description text,
  invoice_number text,
  sub_total numeric DEFAULT 0,
  vat_percentage numeric DEFAULT 15,
  amount numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create function to generate towing reference number
CREATE OR REPLACE FUNCTION public.generate_towing_reference(p_tenant_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INTEGER;
  v_chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  v_result TEXT := '';
  i INTEGER;
BEGIN
  -- Generate a random 8-character alphanumeric reference
  FOR i IN 1..8 LOOP
    v_result := v_result || substr(v_chars, floor(random() * length(v_chars) + 1)::int, 1);
  END LOOP;
  RETURN 'TOW' || v_result;
END;
$$;

-- Enable RLS
ALTER TABLE public.towing_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.towing_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.towing_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.towing_invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for towing_records
CREATE POLICY "Users can view towing_records in their tenant"
ON public.towing_records FOR SELECT
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create towing_records in their tenant"
ON public.towing_records FOR INSERT
WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update towing_records in their tenant"
ON public.towing_records FOR UPDATE
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete towing_records in their tenant"
ON public.towing_records FOR DELETE
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

-- RLS Policies for towing_documents
CREATE POLICY "Users can view towing_documents in their tenant"
ON public.towing_documents FOR SELECT
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create towing_documents in their tenant"
ON public.towing_documents FOR INSERT
WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update towing_documents in their tenant"
ON public.towing_documents FOR UPDATE
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete towing_documents in their tenant"
ON public.towing_documents FOR DELETE
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

-- RLS Policies for towing_images
CREATE POLICY "Users can view towing_images in their tenant"
ON public.towing_images FOR SELECT
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create towing_images in their tenant"
ON public.towing_images FOR INSERT
WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update towing_images in their tenant"
ON public.towing_images FOR UPDATE
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete towing_images in their tenant"
ON public.towing_images FOR DELETE
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

-- RLS Policies for towing_invoices
CREATE POLICY "Users can view towing_invoices in their tenant"
ON public.towing_invoices FOR SELECT
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create towing_invoices in their tenant"
ON public.towing_invoices FOR INSERT
WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update towing_invoices in their tenant"
ON public.towing_invoices FOR UPDATE
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete towing_invoices in their tenant"
ON public.towing_invoices FOR DELETE
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

-- Create updated_at trigger for towing_records
CREATE TRIGGER update_towing_records_updated_at
BEFORE UPDATE ON public.towing_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create updated_at trigger for towing_invoices
CREATE TRIGGER update_towing_invoices_updated_at
BEFORE UPDATE ON public.towing_invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for towing files
INSERT INTO storage.buckets (id, name, public) VALUES ('towing', 'towing', true);

-- Storage policies for towing bucket
CREATE POLICY "Authenticated users can view towing files"
ON storage.objects FOR SELECT
USING (bucket_id = 'towing' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can upload towing files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'towing' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update towing files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'towing' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete towing files"
ON storage.objects FOR DELETE
USING (bucket_id = 'towing' AND auth.role() = 'authenticated');
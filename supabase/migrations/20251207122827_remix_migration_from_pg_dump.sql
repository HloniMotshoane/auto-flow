CREATE EXTENSION IF NOT EXISTS "pg_graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "plpgsql";
CREATE EXTENSION IF NOT EXISTS "supabase_vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'manager',
    'user',
    'readonly',
    'super_admin'
);


--
-- Name: tenant_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.tenant_status AS ENUM (
    'active',
    'suspended',
    'archived',
    'pending'
);


--
-- Name: generate_case_number(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_case_number(p_tenant_id uuid) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_count INTEGER;
  v_prefix TEXT;
BEGIN
  SELECT COUNT(*) + 1 INTO v_count 
  FROM public.cases 
  WHERE tenant_id = p_tenant_id;
  
  v_prefix := 'CASE-' || TO_CHAR(NOW(), 'YYMMDD') || '-';
  RETURN v_prefix || LPAD(v_count::TEXT, 4, '0');
END;
$$;


--
-- Name: generate_intake_number(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.generate_intake_number(p_tenant_id uuid) RETURNS text
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
DECLARE
  v_count INTEGER;
  v_prefix TEXT;
BEGIN
  SELECT COUNT(*) + 1 INTO v_count 
  FROM public.vehicle_intakes 
  WHERE tenant_id = p_tenant_id;
  
  v_prefix := 'INT-' || TO_CHAR(NOW(), 'YYMMDD') || '-';
  RETURN v_prefix || LPAD(v_count::TEXT, 4, '0');
END;
$$;


--
-- Name: get_user_organization(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_organization(_user_id uuid) RETURNS uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT organization_id
  FROM public.profiles
  WHERE user_id = _user_id
  LIMIT 1
$$;


--
-- Name: get_user_tenant_id(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_user_tenant_id(_user_id uuid) RETURNS uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT tenant_id
  FROM public.profiles
  WHERE user_id = _user_id
  LIMIT 1
$$;


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: is_super_admin(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_super_admin(_user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'super_admin'::app_role
  )
$$;


--
-- Name: is_tenant_admin(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_tenant_admin(_user_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin'::app_role, 'manager'::app_role)
  )
$$;


--
-- Name: is_user_admin(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_user_admin(check_user_id uuid) RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = check_user_id AND role = 'admin'
  );
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


--
-- Name: user_in_organization(uuid, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.user_in_organization(_user_id uuid, _org_id uuid) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND organization_id = _org_id
  )
$$;


SET default_table_access_method = heap;

--
-- Name: assessors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assessors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text,
    phone text,
    cell_number text,
    company text,
    insurance_company_id uuid,
    is_active boolean DEFAULT true,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: branches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.branches (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name text NOT NULL,
    code text,
    address text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: car_makes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.car_makes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    name text NOT NULL,
    country text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: car_models; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.car_models (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    make_id uuid NOT NULL,
    name text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    year_from integer,
    year_to integer,
    engine_size text,
    fuel_type text,
    body_type text,
    transmission text
);


--
-- Name: case_communications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.case_communications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    case_id uuid NOT NULL,
    direction text NOT NULL,
    channel text NOT NULL,
    from_address text,
    to_address text,
    subject text,
    body text,
    attachments jsonb DEFAULT '[]'::jsonb,
    sent_by_user_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT case_communications_channel_check CHECK ((channel = ANY (ARRAY['email'::text, 'whatsapp'::text, 'internal_note'::text, 'sms'::text, 'phone'::text]))),
    CONSTRAINT case_communications_direction_check CHECK ((direction = ANY (ARRAY['inbound'::text, 'outbound'::text])))
);


--
-- Name: case_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.case_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    case_id uuid NOT NULL,
    document_type text NOT NULL,
    file_name text NOT NULL,
    file_url text NOT NULL,
    file_size integer,
    uploaded_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: cases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cases (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    case_number text NOT NULL,
    job_number text,
    intake_id uuid,
    customer_id uuid,
    vehicle_id uuid,
    insurance_company_id uuid,
    claim_reference text,
    authorization_number text,
    excess_amount numeric DEFAULT 0,
    policy_number text,
    current_stage_id uuid,
    status text DEFAULT 'awaiting_reception'::text NOT NULL,
    tow_in_date date,
    tow_company text,
    storage_days integer DEFAULT 0,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    activated_at timestamp with time zone,
    insurance_type text DEFAULT 'private'::text,
    insurance_number text,
    insurance_email text,
    clerk_reference text,
    assessor_id uuid,
    assessor_email text,
    assessor_phone text,
    assessor_company text,
    warranty_status text DEFAULT 'out_of_warranty'::text,
    condition_status text DEFAULT 'non_structural'::text,
    was_towed boolean DEFAULT false,
    tow_contact_number text,
    tow_email text,
    tow_fee numeric DEFAULT 0,
    CONSTRAINT cases_status_check CHECK ((status = ANY (ARRAY['awaiting_reception'::text, 'active'::text, 'in_progress'::text, 'completed'::text, 'delivered'::text, 'cancelled'::text])))
);


--
-- Name: claims; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.claims (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    claim_number text NOT NULL,
    job_id uuid,
    customer_id uuid,
    insurance_company_id uuid,
    status text DEFAULT 'submitted'::text,
    claim_amount numeric DEFAULT 0,
    excess_amount numeric DEFAULT 0,
    authorization_number text,
    notes text,
    submitted_at date,
    approved_at date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    address text,
    city text,
    postal_code text,
    customer_type text DEFAULT 'individual'::text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    first_name text,
    last_name text,
    id_number text,
    date_of_birth date,
    suburb text,
    estimator_id uuid,
    branch_id uuid,
    whatsapp_number text,
    CONSTRAINT customers_customer_type_check CHECK ((customer_type = ANY (ARRAY['individual'::text, 'business'::text, 'insurance'::text])))
);


--
-- Name: emails; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.emails (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    job_id uuid,
    direction text DEFAULT 'inbound'::text NOT NULL,
    from_address text NOT NULL,
    to_address text NOT NULL,
    subject text,
    body text,
    is_read boolean DEFAULT false,
    received_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: insurance_companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.insurance_companies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    name text NOT NULL,
    contact_person text,
    phone text,
    email text,
    address text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: intake_images; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.intake_images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    intake_id uuid NOT NULL,
    image_url text NOT NULL,
    image_type text DEFAULT 'general'::text,
    sequence_number integer NOT NULL,
    is_plate_image boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: job_number_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.job_number_seq
    START WITH 1000
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    quotation_id uuid,
    customer_id uuid,
    vehicle_id uuid,
    job_number text NOT NULL,
    status text DEFAULT 'pending'::text,
    priority text DEFAULT 'normal'::text,
    description text,
    start_date date,
    estimated_completion date,
    actual_completion date,
    assigned_to text,
    bay_number text,
    claim_number text,
    insurance_company text,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT jobs_priority_check CHECK ((priority = ANY (ARRAY['low'::text, 'normal'::text, 'high'::text, 'urgent'::text]))),
    CONSTRAINT jobs_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'waiting_parts'::text, 'paint'::text, 'quality_check'::text, 'completed'::text, 'delivered'::text])))
);


--
-- Name: oem_approvals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.oem_approvals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    make_id uuid,
    brand_name text NOT NULL,
    certificate_number text,
    issue_date date NOT NULL,
    expiry_date date NOT NULL,
    status text DEFAULT 'active'::text,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: organization_invitations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organization_invitations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    email text NOT NULL,
    role public.app_role DEFAULT 'user'::public.app_role NOT NULL,
    invited_by uuid NOT NULL,
    token text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    accepted_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: organizations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.organizations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    logo_url text,
    primary_color text DEFAULT '#3B82F6'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    organization_id uuid,
    module text NOT NULL,
    can_view boolean DEFAULT false,
    can_create boolean DEFAULT false,
    can_edit boolean DEFAULT false,
    can_delete boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    tenant_id uuid
);


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    organization_id uuid,
    first_name text,
    last_name text,
    email text NOT NULL,
    avatar_url text,
    phone text,
    two_factor_enabled boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true,
    job_role text,
    department text,
    company_code text,
    pin text,
    cell_number text,
    branch_id uuid,
    tenant_id uuid
);


--
-- Name: quotations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quotations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    customer_id uuid,
    vehicle_id uuid,
    quote_number text NOT NULL,
    status text DEFAULT 'draft'::text,
    description text,
    labour_cost numeric(10,2) DEFAULT 0,
    parts_cost numeric(10,2) DEFAULT 0,
    paint_cost numeric(10,2) DEFAULT 0,
    other_cost numeric(10,2) DEFAULT 0,
    discount_percent numeric(5,2) DEFAULT 0,
    vat_percent numeric(5,2) DEFAULT 15,
    total_amount numeric(12,2) GENERATED ALWAYS AS ((((((labour_cost + parts_cost) + paint_cost) + other_cost) * ((1)::numeric - (discount_percent / (100)::numeric))) * ((1)::numeric + (vat_percent / (100)::numeric)))) STORED,
    valid_until date,
    notes text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    quote_type text DEFAULT 'money'::text,
    version_number integer DEFAULT 1,
    parent_version_id uuid,
    case_id uuid,
    claim_number text,
    assessment_type text DEFAULT 'full_report'::text,
    waste_disposal boolean DEFAULT false,
    covid_19 boolean DEFAULT false,
    write_off boolean DEFAULT false,
    onsite boolean DEFAULT false,
    polish boolean DEFAULT false,
    agreed_only boolean DEFAULT false,
    authorized boolean DEFAULT false,
    subtotal_labour numeric DEFAULT 0,
    subtotal_paint numeric DEFAULT 0,
    subtotal_parts numeric DEFAULT 0,
    subtotal_strip numeric DEFAULT 0,
    subtotal_frame numeric DEFAULT 0,
    subtotal_outwork numeric DEFAULT 0,
    CONSTRAINT quotations_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'sent'::text, 'approved'::text, 'rejected'::text, 'expired'::text])))
);


--
-- Name: quote_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_documents (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    quotation_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    document_type text NOT NULL,
    file_name text NOT NULL,
    file_url text NOT NULL,
    file_size integer,
    uploaded_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: quote_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    quotation_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    sequence_number integer DEFAULT 1 NOT NULL,
    operation text DEFAULT 'labour'::text NOT NULL,
    description text NOT NULL,
    markup_percent numeric DEFAULT 0,
    betterment_percent numeric DEFAULT 0,
    quantity integer DEFAULT 1,
    part_cost numeric DEFAULT 0,
    labour_cost numeric DEFAULT 0,
    paint_cost numeric DEFAULT 0,
    strip_cost numeric DEFAULT 0,
    frame_cost numeric DEFAULT 0,
    inhouse_outwork_cost numeric DEFAULT 0,
    line_total numeric DEFAULT 0,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: quote_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_notes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    quotation_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    note_type text DEFAULT 'internal'::text NOT NULL,
    content text NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: quote_number_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.quote_number_seq
    START WITH 1000
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: quote_photos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_photos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    quotation_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    quote_item_id uuid,
    image_url text NOT NULL,
    caption text,
    uploaded_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: quote_versions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_versions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    quotation_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    version_number integer NOT NULL,
    version_type text DEFAULT 'original'::text,
    snapshot_data jsonb NOT NULL,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    notes text
);


--
-- Name: quote_work_instructions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.quote_work_instructions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    quotation_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    instruction_type text DEFAULT 'work_instruction'::text,
    content text NOT NULL,
    part_number text,
    supplier text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sla_companies; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sla_companies (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name text NOT NULL,
    email text,
    telephone text,
    cellphone text,
    street text,
    suburb text,
    city text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sla_headers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sla_headers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    company_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    effective_from date NOT NULL,
    effective_to date,
    province text,
    city text,
    metadata jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sla_labour; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sla_labour (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sla_header_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    kind_tags text[] DEFAULT '{}'::text[],
    warranty_rate numeric(10,2) DEFAULT 0,
    non_warranty_rate numeric(10,2) DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sla_outwork; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sla_outwork (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sla_header_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    outwork_type text DEFAULT 'rule_based_caps'::text,
    wheel_alignment_percent numeric(5,2) DEFAULT 0,
    air_con_percent numeric(5,2) DEFAULT 0,
    diagnostics_percent numeric(5,2) DEFAULT 0,
    warranty_checks_percent numeric(5,2) DEFAULT 0,
    courier_fees_percent numeric(5,2) DEFAULT 0,
    electrical_percent numeric(5,2) DEFAULT 0,
    mechanical_percent numeric(5,2) DEFAULT 0,
    mechanical_reports_percent numeric(5,2) DEFAULT 0,
    jig_hire_percent numeric(5,2) DEFAULT 0,
    upholstery_percent numeric(5,2) DEFAULT 0,
    cooling_systems_percent numeric(5,2) DEFAULT 0,
    railvan_repair_percent numeric(5,2) DEFAULT 0,
    on_off_bench_setup_minutes integer DEFAULT 0,
    on_off_jig_setup_minutes integer DEFAULT 0,
    floor_anchorage_minutes integer DEFAULT 0,
    windscreen_replacement_percent numeric(5,2) DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sla_paint; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sla_paint (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sla_header_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    kind_tags text[] DEFAULT '{}'::text[],
    warranty_per_panel numeric(10,2) DEFAULT 0,
    non_warranty_per_panel numeric(10,2) DEFAULT 0,
    blending numeric(10,2) DEFAULT 0,
    small_panel_paint numeric(10,2) DEFAULT 0,
    small_repair_paint numeric(10,2) DEFAULT 0,
    water_based numeric(10,2) DEFAULT 0,
    pearlescent_normal numeric(10,2) DEFAULT 0,
    pearlescent_3_stage numeric(10,2) DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sla_parts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sla_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sla_header_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    parts_type text DEFAULT 'type_1_simple'::text,
    new_oem_percent numeric(5,2) DEFAULT 0,
    alt_from_manufacturer_percent numeric(5,2) DEFAULT 0,
    alt_non_manufacturer_percent numeric(5,2) DEFAULT 0,
    used_percent numeric(5,2) DEFAULT 0,
    aftermarket_percent numeric(5,2) DEFAULT 0,
    new_oem_in_stock_factor numeric(5,2) DEFAULT 0,
    used_oem_in_stock_factor numeric(5,2) DEFAULT 0,
    alternative_in_stock_factor numeric(5,2) DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sla_sundries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sla_sundries (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sla_header_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    sundries_type text DEFAULT 'type_1_percent_with_cap'::text,
    parts_percent numeric(5,2) DEFAULT 0,
    cap_amount numeric(10,2),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: sla_towing; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sla_towing (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sla_header_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    towing_type text DEFAULT 'type_1_simple'::text,
    storage_per_day numeric(10,2) DEFAULT 0,
    first_km_free numeric(10,2) DEFAULT 0,
    per_km_thereafter numeric(10,2) DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: special_action_permissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.special_action_permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    action_name text NOT NULL,
    is_enabled boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: stage_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stage_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    case_id uuid NOT NULL,
    stage_id uuid NOT NULL,
    previous_stage_id uuid,
    updated_by uuid NOT NULL,
    notes text,
    notified_customer boolean DEFAULT false,
    notification_type text DEFAULT 'none'::text,
    notification_sent_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: tenants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tenants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    branch_name text NOT NULL,
    company_name text NOT NULL,
    status public.tenant_status DEFAULT 'active'::public.tenant_status NOT NULL,
    contact_person text,
    email text,
    phone text,
    address_line_1 text,
    address_line_2 text,
    city text,
    province text,
    country text,
    vat_number text,
    registration_number text,
    credits integer DEFAULT 0 NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    organization_id uuid,
    role public.app_role DEFAULT 'user'::public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: user_stage_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_stage_assignments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    stage_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: vehicle_intakes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vehicle_intakes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    intake_number text NOT NULL,
    plate_number text,
    plate_image_url text,
    intake_officer_id uuid NOT NULL,
    vehicle_make_detected text,
    vehicle_model_detected text,
    status text DEFAULT 'pending'::text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT vehicle_intakes_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'assigned'::text, 'converted'::text])))
);


--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vehicles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    customer_id uuid,
    make text NOT NULL,
    model text NOT NULL,
    year integer,
    vin text,
    registration text,
    color text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    engine_number text,
    odometer integer,
    booking_date date,
    quote_date date,
    tenant_id uuid
);


--
-- Name: workflow_stages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.workflow_stages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    order_index integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    notify_customer boolean DEFAULT true,
    notification_template text,
    color text DEFAULT '#3B82F6'::text
);


--
-- Name: assessors assessors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessors
    ADD CONSTRAINT assessors_pkey PRIMARY KEY (id);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: car_makes car_makes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car_makes
    ADD CONSTRAINT car_makes_pkey PRIMARY KEY (id);


--
-- Name: car_models car_models_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car_models
    ADD CONSTRAINT car_models_pkey PRIMARY KEY (id);


--
-- Name: case_communications case_communications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.case_communications
    ADD CONSTRAINT case_communications_pkey PRIMARY KEY (id);


--
-- Name: case_documents case_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.case_documents
    ADD CONSTRAINT case_documents_pkey PRIMARY KEY (id);


--
-- Name: cases cases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_pkey PRIMARY KEY (id);


--
-- Name: claims claims_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.claims
    ADD CONSTRAINT claims_pkey PRIMARY KEY (id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: emails emails_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emails
    ADD CONSTRAINT emails_pkey PRIMARY KEY (id);


--
-- Name: insurance_companies insurance_companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.insurance_companies
    ADD CONSTRAINT insurance_companies_pkey PRIMARY KEY (id);


--
-- Name: intake_images intake_images_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.intake_images
    ADD CONSTRAINT intake_images_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: oem_approvals oem_approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oem_approvals
    ADD CONSTRAINT oem_approvals_pkey PRIMARY KEY (id);


--
-- Name: organization_invitations organization_invitations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_invitations
    ADD CONSTRAINT organization_invitations_pkey PRIMARY KEY (id);


--
-- Name: organization_invitations organization_invitations_token_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_invitations
    ADD CONSTRAINT organization_invitations_token_key UNIQUE (token);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organizations
    ADD CONSTRAINT organizations_slug_key UNIQUE (slug);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_user_id_organization_id_module_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_user_id_organization_id_module_key UNIQUE (user_id, organization_id, module);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);


--
-- Name: quotations quotations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_pkey PRIMARY KEY (id);


--
-- Name: quote_documents quote_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_documents
    ADD CONSTRAINT quote_documents_pkey PRIMARY KEY (id);


--
-- Name: quote_items quote_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_items
    ADD CONSTRAINT quote_items_pkey PRIMARY KEY (id);


--
-- Name: quote_notes quote_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_notes
    ADD CONSTRAINT quote_notes_pkey PRIMARY KEY (id);


--
-- Name: quote_photos quote_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_photos
    ADD CONSTRAINT quote_photos_pkey PRIMARY KEY (id);


--
-- Name: quote_versions quote_versions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_versions
    ADD CONSTRAINT quote_versions_pkey PRIMARY KEY (id);


--
-- Name: quote_work_instructions quote_work_instructions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_work_instructions
    ADD CONSTRAINT quote_work_instructions_pkey PRIMARY KEY (id);


--
-- Name: sla_companies sla_companies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sla_companies
    ADD CONSTRAINT sla_companies_pkey PRIMARY KEY (id);


--
-- Name: sla_headers sla_headers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sla_headers
    ADD CONSTRAINT sla_headers_pkey PRIMARY KEY (id);


--
-- Name: sla_labour sla_labour_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sla_labour
    ADD CONSTRAINT sla_labour_pkey PRIMARY KEY (id);


--
-- Name: sla_outwork sla_outwork_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sla_outwork
    ADD CONSTRAINT sla_outwork_pkey PRIMARY KEY (id);


--
-- Name: sla_paint sla_paint_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sla_paint
    ADD CONSTRAINT sla_paint_pkey PRIMARY KEY (id);


--
-- Name: sla_parts sla_parts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sla_parts
    ADD CONSTRAINT sla_parts_pkey PRIMARY KEY (id);


--
-- Name: sla_sundries sla_sundries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sla_sundries
    ADD CONSTRAINT sla_sundries_pkey PRIMARY KEY (id);


--
-- Name: sla_towing sla_towing_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sla_towing
    ADD CONSTRAINT sla_towing_pkey PRIMARY KEY (id);


--
-- Name: special_action_permissions special_action_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.special_action_permissions
    ADD CONSTRAINT special_action_permissions_pkey PRIMARY KEY (id);


--
-- Name: special_action_permissions special_action_permissions_user_id_action_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.special_action_permissions
    ADD CONSTRAINT special_action_permissions_user_id_action_name_key UNIQUE (user_id, action_name);


--
-- Name: stage_history stage_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stage_history
    ADD CONSTRAINT stage_history_pkey PRIMARY KEY (id);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_organization_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_organization_id_key UNIQUE (user_id, organization_id);


--
-- Name: user_stage_assignments user_stage_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_stage_assignments
    ADD CONSTRAINT user_stage_assignments_pkey PRIMARY KEY (id);


--
-- Name: user_stage_assignments user_stage_assignments_user_id_stage_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_stage_assignments
    ADD CONSTRAINT user_stage_assignments_user_id_stage_id_key UNIQUE (user_id, stage_id);


--
-- Name: vehicle_intakes vehicle_intakes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_intakes
    ADD CONSTRAINT vehicle_intakes_pkey PRIMARY KEY (id);


--
-- Name: vehicles vehicles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_pkey PRIMARY KEY (id);


--
-- Name: workflow_stages workflow_stages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_stages
    ADD CONSTRAINT workflow_stages_pkey PRIMARY KEY (id);


--
-- Name: idx_car_models_body_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_car_models_body_type ON public.car_models USING btree (body_type);


--
-- Name: idx_car_models_year_from; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_car_models_year_from ON public.car_models USING btree (year_from);


--
-- Name: idx_case_communications_case; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_case_communications_case ON public.case_communications USING btree (case_id);


--
-- Name: idx_case_documents_case; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_case_documents_case ON public.case_documents USING btree (case_id);


--
-- Name: idx_cases_intake; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cases_intake ON public.cases USING btree (intake_id);


--
-- Name: idx_cases_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cases_status ON public.cases USING btree (status);


--
-- Name: idx_cases_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cases_tenant ON public.cases USING btree (tenant_id);


--
-- Name: idx_intake_images_intake; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_intake_images_intake ON public.intake_images USING btree (intake_id);


--
-- Name: idx_quote_documents_quotation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_documents_quotation ON public.quote_documents USING btree (quotation_id);


--
-- Name: idx_quote_items_quotation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_items_quotation ON public.quote_items USING btree (quotation_id);


--
-- Name: idx_quote_notes_quotation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_notes_quotation ON public.quote_notes USING btree (quotation_id);


--
-- Name: idx_quote_photos_quotation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_photos_quotation ON public.quote_photos USING btree (quotation_id);


--
-- Name: idx_quote_versions_quotation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_versions_quotation ON public.quote_versions USING btree (quotation_id);


--
-- Name: idx_quote_work_instructions_quotation; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_quote_work_instructions_quotation ON public.quote_work_instructions USING btree (quotation_id);


--
-- Name: idx_stage_history_case_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stage_history_case_id ON public.stage_history USING btree (case_id);


--
-- Name: idx_stage_history_tenant_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stage_history_tenant_id ON public.stage_history USING btree (tenant_id);


--
-- Name: idx_tenants_branch_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tenants_branch_name ON public.tenants USING btree (branch_name);


--
-- Name: idx_tenants_company_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tenants_company_name ON public.tenants USING btree (company_name);


--
-- Name: idx_tenants_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tenants_status ON public.tenants USING btree (status);


--
-- Name: idx_vehicle_intakes_plate; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vehicle_intakes_plate ON public.vehicle_intakes USING btree (plate_number);


--
-- Name: idx_vehicle_intakes_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vehicle_intakes_status ON public.vehicle_intakes USING btree (status);


--
-- Name: idx_vehicle_intakes_tenant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vehicle_intakes_tenant ON public.vehicle_intakes USING btree (tenant_id);


--
-- Name: assessors update_assessors_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_assessors_updated_at BEFORE UPDATE ON public.assessors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: branches update_branches_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: car_makes update_car_makes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_car_makes_updated_at BEFORE UPDATE ON public.car_makes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: car_models update_car_models_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_car_models_updated_at BEFORE UPDATE ON public.car_models FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: cases update_cases_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: claims update_claims_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_claims_updated_at BEFORE UPDATE ON public.claims FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: customers update_customers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: insurance_companies update_insurance_companies_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_insurance_companies_updated_at BEFORE UPDATE ON public.insurance_companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: jobs update_jobs_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON public.jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: oem_approvals update_oem_approvals_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_oem_approvals_updated_at BEFORE UPDATE ON public.oem_approvals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: organizations update_organizations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: permissions update_permissions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON public.permissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: profiles update_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: quotations update_quotations_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON public.quotations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: quote_items update_quote_items_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_quote_items_updated_at BEFORE UPDATE ON public.quote_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: quote_work_instructions update_quote_work_instructions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_quote_work_instructions_updated_at BEFORE UPDATE ON public.quote_work_instructions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: sla_companies update_sla_companies_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_sla_companies_updated_at BEFORE UPDATE ON public.sla_companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: sla_headers update_sla_headers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_sla_headers_updated_at BEFORE UPDATE ON public.sla_headers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: sla_labour update_sla_labour_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_sla_labour_updated_at BEFORE UPDATE ON public.sla_labour FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: sla_outwork update_sla_outwork_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_sla_outwork_updated_at BEFORE UPDATE ON public.sla_outwork FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: sla_paint update_sla_paint_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_sla_paint_updated_at BEFORE UPDATE ON public.sla_paint FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: sla_parts update_sla_parts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_sla_parts_updated_at BEFORE UPDATE ON public.sla_parts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: sla_sundries update_sla_sundries_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_sla_sundries_updated_at BEFORE UPDATE ON public.sla_sundries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: sla_towing update_sla_towing_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_sla_towing_updated_at BEFORE UPDATE ON public.sla_towing FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: special_action_permissions update_special_action_permissions_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_special_action_permissions_updated_at BEFORE UPDATE ON public.special_action_permissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: tenants update_tenants_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: vehicle_intakes update_vehicle_intakes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_vehicle_intakes_updated_at BEFORE UPDATE ON public.vehicle_intakes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: vehicles update_vehicles_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: workflow_stages update_workflow_stages_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_workflow_stages_updated_at BEFORE UPDATE ON public.workflow_stages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: assessors assessors_insurance_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessors
    ADD CONSTRAINT assessors_insurance_company_id_fkey FOREIGN KEY (insurance_company_id) REFERENCES public.insurance_companies(id) ON DELETE SET NULL;


--
-- Name: assessors assessors_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assessors
    ADD CONSTRAINT assessors_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: branches branches_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: car_models car_models_make_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.car_models
    ADD CONSTRAINT car_models_make_id_fkey FOREIGN KEY (make_id) REFERENCES public.car_makes(id) ON DELETE CASCADE;


--
-- Name: case_communications case_communications_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.case_communications
    ADD CONSTRAINT case_communications_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;


--
-- Name: case_documents case_documents_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.case_documents
    ADD CONSTRAINT case_documents_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;


--
-- Name: cases cases_current_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_current_stage_id_fkey FOREIGN KEY (current_stage_id) REFERENCES public.workflow_stages(id);


--
-- Name: cases cases_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id);


--
-- Name: cases cases_intake_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_intake_id_fkey FOREIGN KEY (intake_id) REFERENCES public.vehicle_intakes(id);


--
-- Name: cases cases_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: cases cases_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cases
    ADD CONSTRAINT cases_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id);


--
-- Name: claims claims_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.claims
    ADD CONSTRAINT claims_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: claims claims_insurance_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.claims
    ADD CONSTRAINT claims_insurance_company_id_fkey FOREIGN KEY (insurance_company_id) REFERENCES public.insurance_companies(id) ON DELETE SET NULL;


--
-- Name: claims claims_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.claims
    ADD CONSTRAINT claims_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE SET NULL;


--
-- Name: customers customers_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: emails emails_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.emails
    ADD CONSTRAINT emails_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE SET NULL;


--
-- Name: intake_images intake_images_intake_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.intake_images
    ADD CONSTRAINT intake_images_intake_id_fkey FOREIGN KEY (intake_id) REFERENCES public.vehicle_intakes(id) ON DELETE CASCADE;


--
-- Name: jobs jobs_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: jobs jobs_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: jobs jobs_quotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_quotation_id_fkey FOREIGN KEY (quotation_id) REFERENCES public.quotations(id) ON DELETE SET NULL;


--
-- Name: jobs jobs_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE SET NULL;


--
-- Name: oem_approvals oem_approvals_make_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oem_approvals
    ADD CONSTRAINT oem_approvals_make_id_fkey FOREIGN KEY (make_id) REFERENCES public.car_makes(id) ON DELETE SET NULL;


--
-- Name: organization_invitations organization_invitations_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.organization_invitations
    ADD CONSTRAINT organization_invitations_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: permissions permissions_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: permissions permissions_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: profiles profiles_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: profiles profiles_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);


--
-- Name: quotations quotations_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: quotations quotations_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: quotations quotations_vehicle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_vehicle_id_fkey FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE SET NULL;


--
-- Name: quote_documents quote_documents_quotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_documents
    ADD CONSTRAINT quote_documents_quotation_id_fkey FOREIGN KEY (quotation_id) REFERENCES public.quotations(id) ON DELETE CASCADE;


--
-- Name: quote_items quote_items_quotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_items
    ADD CONSTRAINT quote_items_quotation_id_fkey FOREIGN KEY (quotation_id) REFERENCES public.quotations(id) ON DELETE CASCADE;


--
-- Name: quote_notes quote_notes_quotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_notes
    ADD CONSTRAINT quote_notes_quotation_id_fkey FOREIGN KEY (quotation_id) REFERENCES public.quotations(id) ON DELETE CASCADE;


--
-- Name: quote_photos quote_photos_quotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_photos
    ADD CONSTRAINT quote_photos_quotation_id_fkey FOREIGN KEY (quotation_id) REFERENCES public.quotations(id) ON DELETE CASCADE;


--
-- Name: quote_photos quote_photos_quote_item_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_photos
    ADD CONSTRAINT quote_photos_quote_item_id_fkey FOREIGN KEY (quote_item_id) REFERENCES public.quote_items(id) ON DELETE SET NULL;


--
-- Name: quote_versions quote_versions_quotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_versions
    ADD CONSTRAINT quote_versions_quotation_id_fkey FOREIGN KEY (quotation_id) REFERENCES public.quotations(id) ON DELETE CASCADE;


--
-- Name: quote_work_instructions quote_work_instructions_quotation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.quote_work_instructions
    ADD CONSTRAINT quote_work_instructions_quotation_id_fkey FOREIGN KEY (quotation_id) REFERENCES public.quotations(id) ON DELETE CASCADE;


--
-- Name: sla_companies sla_companies_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sla_companies
    ADD CONSTRAINT sla_companies_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: sla_headers sla_headers_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sla_headers
    ADD CONSTRAINT sla_headers_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.sla_companies(id) ON DELETE CASCADE;


--
-- Name: sla_headers sla_headers_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sla_headers
    ADD CONSTRAINT sla_headers_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: sla_labour sla_labour_sla_header_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sla_labour
    ADD CONSTRAINT sla_labour_sla_header_id_fkey FOREIGN KEY (sla_header_id) REFERENCES public.sla_headers(id) ON DELETE CASCADE;


--
-- Name: sla_labour sla_labour_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sla_labour
    ADD CONSTRAINT sla_labour_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: sla_outwork sla_outwork_sla_header_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sla_outwork
    ADD CONSTRAINT sla_outwork_sla_header_id_fkey FOREIGN KEY (sla_header_id) REFERENCES public.sla_headers(id) ON DELETE CASCADE;


--
-- Name: sla_outwork sla_outwork_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sla_outwork
    ADD CONSTRAINT sla_outwork_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: sla_paint sla_paint_sla_header_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sla_paint
    ADD CONSTRAINT sla_paint_sla_header_id_fkey FOREIGN KEY (sla_header_id) REFERENCES public.sla_headers(id) ON DELETE CASCADE;


--
-- Name: sla_paint sla_paint_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sla_paint
    ADD CONSTRAINT sla_paint_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: sla_parts sla_parts_sla_header_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sla_parts
    ADD CONSTRAINT sla_parts_sla_header_id_fkey FOREIGN KEY (sla_header_id) REFERENCES public.sla_headers(id) ON DELETE CASCADE;


--
-- Name: sla_parts sla_parts_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sla_parts
    ADD CONSTRAINT sla_parts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: sla_sundries sla_sundries_sla_header_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sla_sundries
    ADD CONSTRAINT sla_sundries_sla_header_id_fkey FOREIGN KEY (sla_header_id) REFERENCES public.sla_headers(id) ON DELETE CASCADE;


--
-- Name: sla_sundries sla_sundries_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sla_sundries
    ADD CONSTRAINT sla_sundries_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: sla_towing sla_towing_sla_header_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sla_towing
    ADD CONSTRAINT sla_towing_sla_header_id_fkey FOREIGN KEY (sla_header_id) REFERENCES public.sla_headers(id) ON DELETE CASCADE;


--
-- Name: sla_towing sla_towing_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sla_towing
    ADD CONSTRAINT sla_towing_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: special_action_permissions special_action_permissions_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.special_action_permissions
    ADD CONSTRAINT special_action_permissions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: special_action_permissions special_action_permissions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.special_action_permissions
    ADD CONSTRAINT special_action_permissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: stage_history stage_history_case_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stage_history
    ADD CONSTRAINT stage_history_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;


--
-- Name: stage_history stage_history_previous_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stage_history
    ADD CONSTRAINT stage_history_previous_stage_id_fkey FOREIGN KEY (previous_stage_id) REFERENCES public.workflow_stages(id) ON DELETE SET NULL;


--
-- Name: stage_history stage_history_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stage_history
    ADD CONSTRAINT stage_history_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.workflow_stages(id) ON DELETE CASCADE;


--
-- Name: stage_history stage_history_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stage_history
    ADD CONSTRAINT stage_history_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: user_stage_assignments user_stage_assignments_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_stage_assignments
    ADD CONSTRAINT user_stage_assignments_stage_id_fkey FOREIGN KEY (stage_id) REFERENCES public.workflow_stages(id) ON DELETE CASCADE;


--
-- Name: user_stage_assignments user_stage_assignments_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_stage_assignments
    ADD CONSTRAINT user_stage_assignments_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: user_stage_assignments user_stage_assignments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_stage_assignments
    ADD CONSTRAINT user_stage_assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: vehicle_intakes vehicle_intakes_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicle_intakes
    ADD CONSTRAINT vehicle_intakes_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: vehicles vehicles_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: vehicles vehicles_organization_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT vehicles_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE;


--
-- Name: workflow_stages workflow_stages_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.workflow_stages
    ADD CONSTRAINT workflow_stages_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;


--
-- Name: organization_invitations Admins can create invitations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can create invitations" ON public.organization_invitations FOR INSERT WITH CHECK ((organization_id IN ( SELECT user_roles.organization_id
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));


--
-- Name: permissions Admins can manage permissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage permissions" ON public.permissions USING ((organization_id IN ( SELECT user_roles.organization_id
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));


--
-- Name: user_roles Admins can manage roles in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage roles in their organization" ON public.user_roles USING (public.is_user_admin(auth.uid()));


--
-- Name: organizations Admins can update their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update their organization" ON public.organizations FOR UPDATE USING ((id IN ( SELECT user_roles.organization_id
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));


--
-- Name: permissions Admins can view all permissions in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all permissions in their organization" ON public.permissions FOR SELECT TO authenticated USING ((organization_id IN ( SELECT user_roles.organization_id
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));


--
-- Name: profiles Allow profile creation during signup; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow profile creation during signup" ON public.profiles FOR INSERT WITH CHECK ((user_id = auth.uid()));


--
-- Name: organizations Authenticated users can create organizations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create organizations" ON public.organizations FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: organization_invitations Only admins can view invitations; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only admins can view invitations" ON public.organization_invitations FOR SELECT TO authenticated USING ((organization_id IN ( SELECT user_roles.organization_id
   FROM public.user_roles
  WHERE ((user_roles.user_id = auth.uid()) AND (user_roles.role = 'admin'::public.app_role)))));


--
-- Name: branches Super admins can create branches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can create branches" ON public.branches FOR INSERT WITH CHECK (public.is_super_admin(auth.uid()));


--
-- Name: tenants Super admins can create tenants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can create tenants" ON public.tenants FOR INSERT WITH CHECK (public.is_super_admin(auth.uid()));


--
-- Name: branches Super admins can delete branches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can delete branches" ON public.branches FOR DELETE USING (public.is_super_admin(auth.uid()));


--
-- Name: tenants Super admins can delete tenants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can delete tenants" ON public.tenants FOR DELETE USING (public.is_super_admin(auth.uid()));


--
-- Name: special_action_permissions Super admins can manage special_action_permissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can manage special_action_permissions" ON public.special_action_permissions USING (public.is_super_admin(auth.uid()));


--
-- Name: user_stage_assignments Super admins can manage user_stage_assignments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can manage user_stage_assignments" ON public.user_stage_assignments USING (public.is_super_admin(auth.uid()));


--
-- Name: workflow_stages Super admins can manage workflow_stages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can manage workflow_stages" ON public.workflow_stages USING (public.is_super_admin(auth.uid()));


--
-- Name: branches Super admins can update branches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can update branches" ON public.branches FOR UPDATE USING (public.is_super_admin(auth.uid()));


--
-- Name: tenants Super admins can update tenants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can update tenants" ON public.tenants FOR UPDATE USING (public.is_super_admin(auth.uid()));


--
-- Name: branches Super admins can view all branches; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can view all branches" ON public.branches FOR SELECT USING (public.is_super_admin(auth.uid()));


--
-- Name: tenants Super admins can view all tenants; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Super admins can view all tenants" ON public.tenants FOR SELECT USING (public.is_super_admin(auth.uid()));


--
-- Name: permissions Tenant admins can manage permissions in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant admins can manage permissions in their tenant" ON public.permissions USING (((tenant_id = public.get_user_tenant_id(auth.uid())) AND public.is_tenant_admin(auth.uid())));


--
-- Name: special_action_permissions Tenant admins can manage special_action_permissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant admins can manage special_action_permissions" ON public.special_action_permissions USING (((tenant_id = public.get_user_tenant_id(auth.uid())) AND public.is_tenant_admin(auth.uid())));


--
-- Name: user_stage_assignments Tenant admins can manage user_stage_assignments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant admins can manage user_stage_assignments" ON public.user_stage_assignments USING (((tenant_id = public.get_user_tenant_id(auth.uid())) AND public.is_tenant_admin(auth.uid())));


--
-- Name: profiles Tenant admins can update profiles in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant admins can update profiles in their tenant" ON public.profiles FOR UPDATE USING (((tenant_id = public.get_user_tenant_id(auth.uid())) AND public.is_tenant_admin(auth.uid())));


--
-- Name: profiles Tenant admins can view profiles in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant admins can view profiles in their tenant" ON public.profiles FOR SELECT USING (((tenant_id = public.get_user_tenant_id(auth.uid())) AND public.is_tenant_admin(auth.uid())));


--
-- Name: branches Tenant users can view branches in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant users can view branches in their tenant" ON public.branches FOR SELECT USING ((tenant_id = public.get_user_tenant_id(auth.uid())));


--
-- Name: workflow_stages Tenant users can view workflow_stages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Tenant users can view workflow_stages" ON public.workflow_stages FOR SELECT USING ((tenant_id = public.get_user_tenant_id(auth.uid())));


--
-- Name: assessors Users can create assessors in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create assessors in their tenant" ON public.assessors FOR INSERT WITH CHECK (((tenant_id = public.get_user_tenant_id(auth.uid())) OR public.is_super_admin(auth.uid())));


--
-- Name: car_makes Users can create car_makes in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create car_makes in their organization" ON public.car_makes FOR INSERT WITH CHECK ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: car_models Users can create car_models in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create car_models in their organization" ON public.car_models FOR INSERT WITH CHECK ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: cases Users can create cases in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create cases in their tenant" ON public.cases FOR INSERT WITH CHECK (((tenant_id = public.get_user_tenant_id(auth.uid())) OR public.is_super_admin(auth.uid())));


--
-- Name: claims Users can create claims in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create claims in their organization" ON public.claims FOR INSERT WITH CHECK ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: customers Users can create customers in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create customers in their organization" ON public.customers FOR INSERT TO authenticated WITH CHECK ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: emails Users can create emails in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create emails in their organization" ON public.emails FOR INSERT WITH CHECK ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: insurance_companies Users can create insurance_companies in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create insurance_companies in their organization" ON public.insurance_companies FOR INSERT WITH CHECK ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: vehicle_intakes Users can create intakes in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create intakes in their tenant" ON public.vehicle_intakes FOR INSERT WITH CHECK (((tenant_id = public.get_user_tenant_id(auth.uid())) OR public.is_super_admin(auth.uid())));


--
-- Name: jobs Users can create jobs in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create jobs in their organization" ON public.jobs FOR INSERT TO authenticated WITH CHECK ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: oem_approvals Users can create oem_approvals in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create oem_approvals in their organization" ON public.oem_approvals FOR INSERT WITH CHECK ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: quotations Users can create quotations in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create quotations in their organization" ON public.quotations FOR INSERT TO authenticated WITH CHECK ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: quote_items Users can create quote_items in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create quote_items in their organization" ON public.quote_items FOR INSERT WITH CHECK ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: sla_companies Users can create sla_companies in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create sla_companies in their tenant" ON public.sla_companies FOR INSERT WITH CHECK (((tenant_id = public.get_user_tenant_id(auth.uid())) OR public.is_super_admin(auth.uid())));


--
-- Name: stage_history Users can create stage history in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create stage history in their tenant" ON public.stage_history FOR INSERT WITH CHECK (((tenant_id = public.get_user_tenant_id(auth.uid())) OR public.is_super_admin(auth.uid())));


--
-- Name: vehicles Users can create vehicles in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create vehicles in their organization" ON public.vehicles FOR INSERT TO authenticated WITH CHECK ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: assessors Users can delete assessors in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete assessors in their tenant" ON public.assessors FOR DELETE USING (((tenant_id = public.get_user_tenant_id(auth.uid())) OR public.is_super_admin(auth.uid())));


--
-- Name: car_makes Users can delete car_makes in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete car_makes in their organization" ON public.car_makes FOR DELETE USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: car_models Users can delete car_models in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete car_models in their organization" ON public.car_models FOR DELETE USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: cases Users can delete cases in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete cases in their tenant" ON public.cases FOR DELETE USING (((tenant_id = public.get_user_tenant_id(auth.uid())) OR public.is_super_admin(auth.uid())));


--
-- Name: claims Users can delete claims in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete claims in their organization" ON public.claims FOR DELETE USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: customers Users can delete customers in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete customers in their organization" ON public.customers FOR DELETE TO authenticated USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: emails Users can delete emails in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete emails in their organization" ON public.emails FOR DELETE USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: insurance_companies Users can delete insurance_companies in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete insurance_companies in their organization" ON public.insurance_companies FOR DELETE USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: vehicle_intakes Users can delete intakes in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete intakes in their tenant" ON public.vehicle_intakes FOR DELETE USING (((tenant_id = public.get_user_tenant_id(auth.uid())) OR public.is_super_admin(auth.uid())));


--
-- Name: jobs Users can delete jobs in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete jobs in their organization" ON public.jobs FOR DELETE TO authenticated USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: oem_approvals Users can delete oem_approvals in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete oem_approvals in their organization" ON public.oem_approvals FOR DELETE USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: quotations Users can delete quotations in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete quotations in their organization" ON public.quotations FOR DELETE TO authenticated USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: quote_items Users can delete quote_items in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete quote_items in their organization" ON public.quote_items FOR DELETE USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: sla_companies Users can delete sla_companies in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete sla_companies in their tenant" ON public.sla_companies FOR DELETE USING (((tenant_id = public.get_user_tenant_id(auth.uid())) OR public.is_super_admin(auth.uid())));


--
-- Name: vehicles Users can delete vehicles in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete vehicles in their organization" ON public.vehicles FOR DELETE TO authenticated USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: case_communications Users can manage case communications; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage case communications" ON public.case_communications USING ((case_id IN ( SELECT cases.id
   FROM public.cases
  WHERE ((cases.tenant_id = public.get_user_tenant_id(auth.uid())) OR public.is_super_admin(auth.uid())))));


--
-- Name: case_documents Users can manage case documents; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage case documents" ON public.case_documents USING ((case_id IN ( SELECT cases.id
   FROM public.cases
  WHERE ((cases.tenant_id = public.get_user_tenant_id(auth.uid())) OR public.is_super_admin(auth.uid())))));


--
-- Name: intake_images Users can manage intake images; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage intake images" ON public.intake_images USING ((intake_id IN ( SELECT vehicle_intakes.id
   FROM public.vehicle_intakes
  WHERE ((vehicle_intakes.tenant_id = public.get_user_tenant_id(auth.uid())) OR public.is_super_admin(auth.uid())))));


--
-- Name: quote_documents Users can manage quote_documents in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage quote_documents in their organization" ON public.quote_documents USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: quote_notes Users can manage quote_notes in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage quote_notes in their organization" ON public.quote_notes USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: quote_photos Users can manage quote_photos in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage quote_photos in their organization" ON public.quote_photos USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: quote_versions Users can manage quote_versions in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage quote_versions in their organization" ON public.quote_versions USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: quote_work_instructions Users can manage quote_work_instructions in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage quote_work_instructions in their organization" ON public.quote_work_instructions USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: sla_headers Users can manage sla_headers in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage sla_headers in their tenant" ON public.sla_headers USING (((tenant_id = public.get_user_tenant_id(auth.uid())) OR public.is_super_admin(auth.uid())));


--
-- Name: sla_labour Users can manage sla_labour in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage sla_labour in their tenant" ON public.sla_labour USING (((tenant_id = public.get_user_tenant_id(auth.uid())) OR public.is_super_admin(auth.uid())));


--
-- Name: sla_outwork Users can manage sla_outwork in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage sla_outwork in their tenant" ON public.sla_outwork USING (((tenant_id = public.get_user_tenant_id(auth.uid())) OR public.is_super_admin(auth.uid())));


--
-- Name: sla_paint Users can manage sla_paint in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage sla_paint in their tenant" ON public.sla_paint USING (((tenant_id = public.get_user_tenant_id(auth.uid())) OR public.is_super_admin(auth.uid())));


--
-- Name: sla_parts Users can manage sla_parts in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage sla_parts in their tenant" ON public.sla_parts USING (((tenant_id = public.get_user_tenant_id(auth.uid())) OR public.is_super_admin(auth.uid())));


--
-- Name: sla_sundries Users can manage sla_sundries in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage sla_sundries in their tenant" ON public.sla_sundries USING (((tenant_id = public.get_user_tenant_id(auth.uid())) OR public.is_super_admin(auth.uid())));


--
-- Name: sla_towing Users can manage sla_towing in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can manage sla_towing in their tenant" ON public.sla_towing USING (((tenant_id = public.get_user_tenant_id(auth.uid())) OR public.is_super_admin(auth.uid())));


--
-- Name: assessors Users can update assessors in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update assessors in their tenant" ON public.assessors FOR UPDATE USING (((tenant_id = public.get_user_tenant_id(auth.uid())) OR public.is_super_admin(auth.uid())));


--
-- Name: car_makes Users can update car_makes in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update car_makes in their organization" ON public.car_makes FOR UPDATE USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: car_models Users can update car_models in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update car_models in their organization" ON public.car_models FOR UPDATE USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: cases Users can update cases in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update cases in their tenant" ON public.cases FOR UPDATE USING (((tenant_id = public.get_user_tenant_id(auth.uid())) OR public.is_super_admin(auth.uid())));


--
-- Name: claims Users can update claims in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update claims in their organization" ON public.claims FOR UPDATE USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: customers Users can update customers in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update customers in their organization" ON public.customers FOR UPDATE TO authenticated USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: emails Users can update emails in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update emails in their organization" ON public.emails FOR UPDATE USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: insurance_companies Users can update insurance_companies in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update insurance_companies in their organization" ON public.insurance_companies FOR UPDATE USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: vehicle_intakes Users can update intakes in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update intakes in their tenant" ON public.vehicle_intakes FOR UPDATE USING (((tenant_id = public.get_user_tenant_id(auth.uid())) OR public.is_super_admin(auth.uid())));


--
-- Name: jobs Users can update jobs in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update jobs in their organization" ON public.jobs FOR UPDATE TO authenticated USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: oem_approvals Users can update oem_approvals in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update oem_approvals in their organization" ON public.oem_approvals FOR UPDATE USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: quotations Users can update quotations in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update quotations in their organization" ON public.quotations FOR UPDATE TO authenticated USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: quote_items Users can update quote_items in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update quote_items in their organization" ON public.quote_items FOR UPDATE USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: sla_companies Users can update sla_companies in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update sla_companies in their tenant" ON public.sla_companies FOR UPDATE USING (((tenant_id = public.get_user_tenant_id(auth.uid())) OR public.is_super_admin(auth.uid())));


--
-- Name: stage_history Users can update stage history in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update stage history in their tenant" ON public.stage_history FOR UPDATE USING (((tenant_id = public.get_user_tenant_id(auth.uid())) OR public.is_super_admin(auth.uid())));


--
-- Name: profiles Users can update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING ((user_id = auth.uid()));


--
-- Name: vehicles Users can update vehicles in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update vehicles in their organization" ON public.vehicles FOR UPDATE TO authenticated USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: assessors Users can view assessors in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view assessors in their tenant" ON public.assessors FOR SELECT USING (((tenant_id = public.get_user_tenant_id(auth.uid())) OR public.is_super_admin(auth.uid())));


--
-- Name: car_makes Users can view car_makes in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view car_makes in their organization" ON public.car_makes FOR SELECT USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: car_models Users can view car_models in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view car_models in their organization" ON public.car_models FOR SELECT USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: cases Users can view cases in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view cases in their tenant" ON public.cases FOR SELECT USING (((tenant_id = public.get_user_tenant_id(auth.uid())) OR public.is_super_admin(auth.uid())));


--
-- Name: claims Users can view claims in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view claims in their organization" ON public.claims FOR SELECT USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: customers Users can view customers in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view customers in their organization" ON public.customers FOR SELECT TO authenticated USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: emails Users can view emails in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view emails in their organization" ON public.emails FOR SELECT USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: insurance_companies Users can view insurance_companies in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view insurance_companies in their organization" ON public.insurance_companies FOR SELECT USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: vehicle_intakes Users can view intakes in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view intakes in their tenant" ON public.vehicle_intakes FOR SELECT USING (((tenant_id = public.get_user_tenant_id(auth.uid())) OR public.is_super_admin(auth.uid())));


--
-- Name: jobs Users can view jobs in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view jobs in their organization" ON public.jobs FOR SELECT TO authenticated USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: oem_approvals Users can view oem_approvals in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view oem_approvals in their organization" ON public.oem_approvals FOR SELECT USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: permissions Users can view only their own permissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view only their own permissions" ON public.permissions FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- Name: profiles Users can view own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING ((user_id = auth.uid()));


--
-- Name: profiles Users can view profiles in same organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view profiles in same organization" ON public.profiles FOR SELECT USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: quotations Users can view quotations in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view quotations in their organization" ON public.quotations FOR SELECT TO authenticated USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: quote_items Users can view quote_items in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view quote_items in their organization" ON public.quote_items FOR SELECT USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: user_roles Users can view roles in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view roles in their organization" ON public.user_roles FOR SELECT USING ((organization_id IN ( SELECT profiles.organization_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: sla_companies Users can view sla_companies in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view sla_companies in their tenant" ON public.sla_companies FOR SELECT USING (((tenant_id = public.get_user_tenant_id(auth.uid())) OR public.is_super_admin(auth.uid())));


--
-- Name: stage_history Users can view stage history in their tenant; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view stage history in their tenant" ON public.stage_history FOR SELECT USING (((tenant_id = public.get_user_tenant_id(auth.uid())) OR public.is_super_admin(auth.uid())));


--
-- Name: organizations Users can view their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their organization" ON public.organizations FOR SELECT USING ((id IN ( SELECT profiles.organization_id
   FROM public.profiles
  WHERE (profiles.user_id = auth.uid()))));


--
-- Name: vehicles Users can view vehicles in their organization; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view vehicles in their organization" ON public.vehicles FOR SELECT TO authenticated USING ((organization_id = public.get_user_organization(auth.uid())));


--
-- Name: assessors; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.assessors ENABLE ROW LEVEL SECURITY;

--
-- Name: branches; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

--
-- Name: car_makes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.car_makes ENABLE ROW LEVEL SECURITY;

--
-- Name: car_models; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.car_models ENABLE ROW LEVEL SECURITY;

--
-- Name: case_communications; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.case_communications ENABLE ROW LEVEL SECURITY;

--
-- Name: case_documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.case_documents ENABLE ROW LEVEL SECURITY;

--
-- Name: cases; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

--
-- Name: claims; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

--
-- Name: customers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

--
-- Name: emails; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;

--
-- Name: insurance_companies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.insurance_companies ENABLE ROW LEVEL SECURITY;

--
-- Name: intake_images; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.intake_images ENABLE ROW LEVEL SECURITY;

--
-- Name: jobs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

--
-- Name: oem_approvals; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.oem_approvals ENABLE ROW LEVEL SECURITY;

--
-- Name: organization_invitations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;

--
-- Name: organizations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

--
-- Name: permissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: quotations; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

--
-- Name: quote_documents; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quote_documents ENABLE ROW LEVEL SECURITY;

--
-- Name: quote_items; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;

--
-- Name: quote_notes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quote_notes ENABLE ROW LEVEL SECURITY;

--
-- Name: quote_photos; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quote_photos ENABLE ROW LEVEL SECURITY;

--
-- Name: quote_versions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quote_versions ENABLE ROW LEVEL SECURITY;

--
-- Name: quote_work_instructions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.quote_work_instructions ENABLE ROW LEVEL SECURITY;

--
-- Name: sla_companies; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sla_companies ENABLE ROW LEVEL SECURITY;

--
-- Name: sla_headers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sla_headers ENABLE ROW LEVEL SECURITY;

--
-- Name: sla_labour; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sla_labour ENABLE ROW LEVEL SECURITY;

--
-- Name: sla_outwork; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sla_outwork ENABLE ROW LEVEL SECURITY;

--
-- Name: sla_paint; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sla_paint ENABLE ROW LEVEL SECURITY;

--
-- Name: sla_parts; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sla_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: sla_sundries; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sla_sundries ENABLE ROW LEVEL SECURITY;

--
-- Name: sla_towing; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.sla_towing ENABLE ROW LEVEL SECURITY;

--
-- Name: special_action_permissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.special_action_permissions ENABLE ROW LEVEL SECURITY;

--
-- Name: stage_history; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.stage_history ENABLE ROW LEVEL SECURITY;

--
-- Name: tenants; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- Name: user_stage_assignments; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_stage_assignments ENABLE ROW LEVEL SECURITY;

--
-- Name: vehicle_intakes; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.vehicle_intakes ENABLE ROW LEVEL SECURITY;

--
-- Name: vehicles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

--
-- Name: workflow_stages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.workflow_stages ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--



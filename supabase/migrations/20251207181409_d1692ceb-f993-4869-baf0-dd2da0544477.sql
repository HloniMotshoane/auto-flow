-- Create consumable categories table
CREATE TABLE public.consumable_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#6B7280',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create consumables table
CREATE TABLE public.consumables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.consumable_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  unit_of_measure TEXT NOT NULL DEFAULT 'each',
  current_stock NUMERIC NOT NULL DEFAULT 0,
  minimum_stock_level NUMERIC NOT NULL DEFAULT 0,
  unit_cost NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create consumable movements table (stock in/out)
CREATE TABLE public.consumable_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  consumable_id UUID NOT NULL REFERENCES public.consumables(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id) ON DELETE SET NULL,
  movement_type TEXT NOT NULL DEFAULT 'in', -- 'in', 'out', 'adjustment'
  quantity NUMERIC NOT NULL,
  unit_cost NUMERIC,
  reason TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create case consumables table (link consumables to cases)
CREATE TABLE public.case_consumables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
  consumable_id UUID NOT NULL REFERENCES public.consumables(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_cost NUMERIC NOT NULL DEFAULT 0,
  total_cost NUMERIC GENERATED ALWAYS AS (quantity * unit_cost) STORED,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.consumable_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consumable_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_consumables ENABLE ROW LEVEL SECURITY;

-- RLS policies for consumable_categories
CREATE POLICY "Users can view consumable_categories in their tenant" 
ON public.consumable_categories FOR SELECT 
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create consumable_categories in their tenant" 
ON public.consumable_categories FOR INSERT 
WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update consumable_categories in their tenant" 
ON public.consumable_categories FOR UPDATE 
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete consumable_categories in their tenant" 
ON public.consumable_categories FOR DELETE 
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

-- RLS policies for consumables
CREATE POLICY "Users can view consumables in their tenant" 
ON public.consumables FOR SELECT 
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create consumables in their tenant" 
ON public.consumables FOR INSERT 
WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update consumables in their tenant" 
ON public.consumables FOR UPDATE 
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete consumables in their tenant" 
ON public.consumables FOR DELETE 
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

-- RLS policies for consumable_movements
CREATE POLICY "Users can view consumable_movements in their tenant" 
ON public.consumable_movements FOR SELECT 
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create consumable_movements in their tenant" 
ON public.consumable_movements FOR INSERT 
WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update consumable_movements in their tenant" 
ON public.consumable_movements FOR UPDATE 
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete consumable_movements in their tenant" 
ON public.consumable_movements FOR DELETE 
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

-- RLS policies for case_consumables
CREATE POLICY "Users can view case_consumables in their tenant" 
ON public.case_consumables FOR SELECT 
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can create case_consumables in their tenant" 
ON public.case_consumables FOR INSERT 
WITH CHECK ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can update case_consumables in their tenant" 
ON public.case_consumables FOR UPDATE 
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

CREATE POLICY "Users can delete case_consumables in their tenant" 
ON public.case_consumables FOR DELETE 
USING ((tenant_id = get_user_tenant_id(auth.uid())) OR is_super_admin(auth.uid()));

-- Create updated_at triggers
CREATE TRIGGER update_consumable_categories_updated_at
BEFORE UPDATE ON public.consumable_categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consumables_updated_at
BEFORE UPDATE ON public.consumables
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_case_consumables_updated_at
BEFORE UPDATE ON public.case_consumables
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.consumable_categories (tenant_id, name, description, color)
SELECT t.id, 'Paint & Finishing', 'Paints, primers, clear coats, and finishing materials', '#3B82F6'
FROM public.tenants t;

INSERT INTO public.consumable_categories (tenant_id, name, description, color)
SELECT t.id, 'Abrasives & Prep', 'Sandpaper, grinding discs, masking tape, and prep materials', '#F59E0B'
FROM public.tenants t;

INSERT INTO public.consumable_categories (tenant_id, name, description, color)
SELECT t.id, 'Safety & Workshop', 'Gloves, masks, cleaning supplies, and general workshop consumables', '#10B981'
FROM public.tenants t;
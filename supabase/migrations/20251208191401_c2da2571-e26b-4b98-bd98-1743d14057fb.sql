-- Add supplier_type and service_categories columns to suppliers table
ALTER TABLE public.suppliers 
ADD COLUMN IF NOT EXISTS supplier_type text DEFAULT 'parts',
ADD COLUMN IF NOT EXISTS service_categories text[] DEFAULT '{}';

-- Add comment for clarity
COMMENT ON COLUMN public.suppliers.supplier_type IS 'Type of supplier: parts, consumables, services, towing, paint';
COMMENT ON COLUMN public.suppliers.service_categories IS 'Array of service categories the supplier provides';
-- Add VIN number column to supplier_parts table
ALTER TABLE public.supplier_parts 
ADD COLUMN vin_number text;
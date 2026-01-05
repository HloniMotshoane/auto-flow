-- Add unique constraint on user_roles (user_id, role) to prevent duplicate role assignments
ALTER TABLE public.user_roles ADD CONSTRAINT user_roles_user_id_role_unique UNIQUE (user_id, role);

-- Insert super_admin role for nikita@siyakhatechnology.co.za
INSERT INTO public.user_roles (user_id, role)
VALUES ('8e6cdf44-7f4c-4a9e-b1d3-26fc8a052fe0', 'super_admin'::app_role)
ON CONFLICT (user_id, role) DO NOTHING;
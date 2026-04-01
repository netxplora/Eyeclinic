-- =============================================
-- RBAC Migration: functions, tables, and policies
-- =============================================

-- 0. Create the has_role helper function (MUST come before any policy that uses it)
CREATE OR REPLACE FUNCTION public.has_role(_role public.app_role, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- 1. Link doctors to their auth user account
ALTER TABLE public.doctors ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Create doctor_services junction table
CREATE TABLE IF NOT EXISTS public.doctor_services (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    doctor_id uuid REFERENCES public.doctors(id) ON DELETE CASCADE,
    service_id uuid REFERENCES public.clinic_services(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(doctor_id, service_id)
);

-- Enable RLS on doctor_services
ALTER TABLE public.doctor_services ENABLE ROW LEVEL SECURITY;

-- Policies for doctor_services (drop first to make idempotent)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.doctor_services;
DROP POLICY IF EXISTS "Enable insert for staff" ON public.doctor_services;
DROP POLICY IF EXISTS "Enable delete for staff" ON public.doctor_services;

CREATE POLICY "Enable read access for all users" ON public.doctor_services FOR SELECT USING (true);
CREATE POLICY "Enable insert for staff" ON public.doctor_services FOR INSERT WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Enable delete for staff" ON public.doctor_services FOR DELETE USING (public.is_staff(auth.uid()));

-- 3. Create clinic_settings table for emergency slots and other configurations
CREATE TABLE IF NOT EXISTS public.clinic_settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text UNIQUE NOT NULL,
    value jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);

-- Insert default emergency slot setting
INSERT INTO public.clinic_settings (name, value) 
VALUES ('emergency_slots', '{"daily_slots": 5}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Enable RLS on clinic_settings
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;

-- Policies for clinic_settings (drop first to make idempotent)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.clinic_settings;
DROP POLICY IF EXISTS "Enable write for admin" ON public.clinic_settings;

CREATE POLICY "Enable read access for all users" ON public.clinic_settings FOR SELECT USING (true);
CREATE POLICY "Enable write for admin" ON public.clinic_settings FOR ALL USING (public.has_role('admin'::public.app_role, auth.uid()));


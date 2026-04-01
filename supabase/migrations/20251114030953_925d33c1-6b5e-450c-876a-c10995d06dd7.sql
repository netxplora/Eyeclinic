-- Create activity log table and restrict doctor role
-- Step 1: Update existing doctor roles to receptionist
UPDATE public.user_roles SET role = 'receptionist' WHERE role = 'doctor';

-- Step 2: Create activity log table for tracking booking changes
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on activity logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Staff can view activity logs
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'activity_logs' AND policyname = 'Staff can view activity logs'
  ) THEN
    CREATE POLICY "Staff can view activity logs"
    ON public.activity_logs
    FOR SELECT
    USING (is_staff(auth.uid()));
  END IF;
END $$;

-- Staff can create activity logs
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'activity_logs' AND policyname = 'Staff can create activity logs'
  ) THEN
    CREATE POLICY "Staff can create activity logs"
    ON public.activity_logs
    FOR INSERT
    WITH CHECK (is_staff(auth.uid()));
  END IF;
END $$;

-- Step 3: Add constraint to prevent doctor role from being used
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_no_doctor_check'
  ) THEN
    ALTER TABLE public.user_roles
    ADD CONSTRAINT user_roles_no_doctor_check
    CHECK (role IN ('admin', 'receptionist'));
  END IF;
END $$;

-- Add indexes for better query performance on activity logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_booking_id ON public.activity_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
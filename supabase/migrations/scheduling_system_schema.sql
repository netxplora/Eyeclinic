-- Create Doctors Table
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    specialization TEXT NOT NULL,
    working_days TEXT[] NOT NULL DEFAULT '{"Monday", "Tuesday", "Wednesday", "Thursday", "Friday"}',
    start_time TIME NOT NULL DEFAULT '09:00:00',
    end_time TIME NOT NULL DEFAULT '17:00:00',
    break_start TIME DEFAULT '13:00:00',
    break_end TIME DEFAULT '14:00:00',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Services Table
CREATE TABLE IF NOT EXISTS public.clinic_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 30,
    buffer_minutes INT NOT NULL DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments Table (Replaces 'bookings' for the new advanced functionality)
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id TEXT NOT NULL UNIQUE,
    patient_name TEXT NOT NULL,
    patient_email TEXT,
    patient_phone TEXT NOT NULL,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
    service_id UUID REFERENCES public.clinic_services(id) ON DELETE RESTRICT,
    appointment_date DATE NOT NULL,
    appointment_start TIME NOT NULL,
    appointment_end TIME NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no-show', 'rescheduled')),
    additional_notes TEXT,
    is_emergency BOOLEAN DEFAULT false,
    reminder_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointment Locks (Prevents double booking via race conditions)
CREATE TABLE IF NOT EXISTS public.appointment_locks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    locked_until TIMESTAMPTZ NOT NULL,
    session_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Waitlist Table
CREATE TABLE IF NOT EXISTS public.waitlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_name TEXT NOT NULL,
    patient_email TEXT,
    patient_phone TEXT NOT NULL,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.clinic_services(id) ON DELETE CASCADE,
    preferred_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'booked', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlists ENABLE ROW LEVEL SECURITY;

-- Anonymous/Public access policies
CREATE POLICY "Public can view active doctors" ON public.doctors FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active services" ON public.clinic_services FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view valid appointment locks" ON public.appointment_locks FOR SELECT USING (locked_until > NOW());
CREATE POLICY "Public can insert appointment locks" ON public.appointment_locks FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can delete locks" ON public.appointment_locks FOR DELETE USING (true); 
CREATE POLICY "Public can insert appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can insert into waitlists" ON public.waitlists FOR INSERT WITH CHECK (true);

-- Authenticated Admin Policies
CREATE POLICY "Admins have full access to doctors" ON public.doctors FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to services" ON public.clinic_services FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to appointments" ON public.appointments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to locks" ON public.appointment_locks FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admins have full access to waitlists" ON public.waitlists FOR ALL USING (auth.role() = 'authenticated');

-- Realtime Features
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointment_locks;

-- Database Indexing for faster scheduling queries
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON public.appointments(doctor_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointment_locks_doctor_date ON public.appointment_locks(doctor_id, appointment_date);

-- Insert Sample Services
INSERT INTO public.clinic_services (service_name, duration_minutes, buffer_minutes, is_active)
VALUES 
    ('Eye Consultation', 30, 10, true),
    ('Eye Test', 20, 10, true),
    ('Contact Lens Fitting', 45, 15, true),
    ('Follow-up Visit', 15, 5, true),
    ('Pediatric Eye Care', 45, 10, true)
ON CONFLICT DO NOTHING;

-- Insert Sample Doctors
INSERT INTO public.doctors (name, specialization, working_days, start_time, end_time, break_start, break_end, is_active)
VALUES 
    ('Dr. Ade', 'Optometrist', '{"Monday", "Tuesday", "Wednesday", "Thursday", "Friday"}', '09:00:00', '17:00:00', '13:00:00', '14:00:00', true),
    ('Dr. Musa', 'Eye Specialist', '{"Monday", "Wednesday", "Friday"}', '09:00:00', '15:00:00', '12:00:00', '13:00:00', true),
    ('Dr. Chioma', 'Pediatric Eye Care', '{"Tuesday", "Thursday", "Saturday"}', '10:00:00', '16:00:00', '13:30:00', '14:30:00', true)
ON CONFLICT DO NOTHING;


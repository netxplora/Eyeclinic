-- Add CHECK constraint to validate booking status values
ALTER TABLE public.bookings 
ADD CONSTRAINT valid_booking_status 
CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled'));
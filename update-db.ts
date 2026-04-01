import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

if (!url || !key) {
  console.error('Missing env vars');
  process.exit(1);
}

const supabase = createClient(url, key);

const newServices = [
  { service_name: 'Comprehensive Eye Examinations', duration_minutes: 45, buffer_minutes: 10, price: 15000, is_active: true },
  { service_name: 'Contact Lens Fitting & Care', duration_minutes: 30, buffer_minutes: 10, price: 20000, is_active: true },
  { service_name: 'Pediatric & Myopia Control', duration_minutes: 45, buffer_minutes: 15, price: 10000, is_active: true },
  { service_name: 'Designer Eyewear & Optical Boutique', duration_minutes: 30, buffer_minutes: 5, price: 25000, is_active: true },
  { service_name: 'Glaucoma & Cataract Screening', duration_minutes: 45, buffer_minutes: 10, price: 12000, is_active: true },
  { service_name: 'Digital Eye Strain Therapy', duration_minutes: 30, buffer_minutes: 10, price: 15000, is_active: true },
  { service_name: 'Diabetic Retinopathy Check', duration_minutes: 45, buffer_minutes: 10, price: 18000, is_active: true },
  { service_name: '24/7 Emergency Eye Care', duration_minutes: 30, buffer_minutes: 0, price: 20000, is_active: true },
  { service_name: 'Advanced Dry Eye Clinic', duration_minutes: 45, buffer_minutes: 10, price: 18000, is_active: true },
  { service_name: 'Surgical Co-management', duration_minutes: 30, buffer_minutes: 10, price: 20000, is_active: false },
  { service_name: 'Low Vision Rehabilitation', duration_minutes: 60, buffer_minutes: 15, price: 25000, is_active: true },
  { service_name: 'Color Vision Testing', duration_minutes: 30, buffer_minutes: 5, price: 10000, is_active: true },
  { service_name: 'Orthokeratology (Ortho-K)', duration_minutes: 60, buffer_minutes: 15, price: 40000, is_active: true }
];

async function sync() {
  console.log("Fetching existing services...");
  const { data: existing, error: fetchErr } = await supabase.from('clinic_services').select('*');
  if (fetchErr) {
    console.error(fetchErr);
    return;
  }
  
  for (const s of newServices) {
    const exists = existing.find(e => e.service_name === s.service_name);
    if (exists) {
      console.log('Update:', s.service_name);
      await supabase.from('clinic_services').update({ ...s }).eq('id', exists.id);
    } else {
      console.log('Insert:', s.service_name);
      await supabase.from('clinic_services').insert([s]);
    }
  }

  // Deactivate old ones that aren't in this list
  for (const e of existing) {
    if (!newServices.find(s => s.service_name === e.service_name)) {
       console.log('Deactivating specific old service:', e.service_name);
       // Instead of deleting, just set is_active = false
       await supabase.from('clinic_services').update({ is_active: false }).eq('id', e.id);
    }
  }

  console.log('Sync complete');
}

sync();

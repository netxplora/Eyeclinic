// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!RESEND_API_KEY || !supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables!");
      return new Response(JSON.stringify({ success: false, error: "Missing config" }), {
        status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Calculate the date window (next 24 hours)
    const now = new Date();
    const tomorrowLocal = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowStr = tomorrowLocal.toISOString().split('T')[0];

    console.log(`Checking for appointments on: ${tomorrowStr}`);

    // 2. Query confirmed appointments scheduled for tomorrow that haven't had a reminder sent
    const { data: upcomingAppointments, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'confirmed')
      .eq('appointment_date', tomorrowStr)
      .eq('reminder_sent', false);

    if (fetchError) throw fetchError;

    if (!upcomingAppointments || upcomingAppointments.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No reminders to send." }), {
        status: 200, headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    console.log(`Found ${upcomingAppointments.length} appointments to remind.`);

    const clinicPhone = "+234 805 907 0153";
    const clinicAddress = "32 W Circular Rd, Tv Rd, beside licensing office, Use, Benin City 300271, Edo";
    
    const results = [];
    for (const appt of upcomingAppointments) {
      if (!appt.patient_email) {
        console.log(`Skipping appointment ${appt.booking_id} because no email is provided.`);
        continue;
      }

      try {
        const formattedDate = new Date(appt.appointment_date).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });

        // Send Reminder Email via fetch
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Satome Eye Clinic <onboarding@resend.dev>",
            to: [appt.patient_email],
            subject: `Reminder: Your Eye Clinic Appointment Tomorrow`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0;">⏰ Appointment Reminder</h1>
                </div>
                <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
                  <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h2 style="color: #1e293b; margin-top: 0;">Hello, ${appt.patient_name}</h2>
                    <p style="color: #475569; line-height: 1.6;">
                      This is a friendly reminder that you have an appointment scheduled for tomorrow at Satome Eye Clinic safely.
                    </p>
                    <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
                      <p style="margin: 8px 0;"><strong>Service:</strong> ${appt.service_type}</p>
                      <p style="margin: 8px 0;"><strong>Date:</strong> ${formattedDate}</p>
                      <p style="margin: 8px 0;"><strong>Time:</strong> ${appt.appointment_time}</p>
                    </div>
                  </div>
                  <div style="background: #e0f2fe; border-left: 4px solid #0284c7; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                    <h3 style="color: #075985; margin-top: 0; font-size: 16px;">Clinic Details</h3>
                    <p style="margin: 5px 0; color: #0369a1;">📞 Phone: ${clinicPhone}</p>
                    <p style="margin: 5px 0; color: #0369a1;">📍 Address: ${clinicAddress}</p>
                  </div>
                </div>
              </div>
            `,
          }),
        });

        const emailResult = await emailRes.json();
        if (!emailRes.ok) throw new Error(JSON.stringify(emailResult));

        // Mark reminder as sent
        await supabase
          .from('bookings')
          .update({ reminder_sent: true })
          .eq('id', appt.id);

        results.push({ id: appt.id, status: 'success' });
        console.log(`Reminder sent for ${appt.booking_id}`);
      } catch (err: any) {
        console.error(`Failed to send reminder for ${appt.booking_id}:`, err);
        results.push({ id: appt.id, status: 'error', error: err.message });
      }
    }

    return new Response(JSON.stringify({ success: true, processed: results.length, results }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  } catch (error: any) {
    console.error("Error in send-appointment-reminders:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
});

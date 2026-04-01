// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawData = await req.json();
    const {
      bookingId,
      patientName,
      patientEmail,
      patientPhone,
      serviceType,
      appointmentDate,
      appointmentTime,
      status,
      additionalNotes
    } = rawData;

    console.log(`Processing booking update for: ${bookingId}, status: ${status}`);

    if (!patientEmail) {
      console.log("No patient email provided, skipping email send.");
      return new Response(JSON.stringify({ success: true, message: "No patient email provided" }), {
        status: 200, headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set!");
      return new Response(JSON.stringify({ success: false, error: "Missing RESEND_API_KEY" }), {
        status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    const clinicPhone = "+234 805 907 0153";
    const clinicAddress = "32 W Circular Rd, Tv Rd, beside licensing office, Use, Benin City 300271, Edo";
    
    let subject = "";
    let headerText = "";
    let bodyText = "";
    let emailIcon = "";
    let headerGradient = "";

    if (status === "confirmed") {
      subject = `Appointment Confirmed – Satome Eye Clinic`;
      headerText = `Appointment Confirmed!`;
      emailIcon = `✅`;
      headerGradient = "linear-gradient(135deg, #10b981, #059669)";
      bodyText = `
        <p style="color: #475569; line-height: 1.6;">
          Great news! Your appointment has been officially confirmed by our clinic staff.
        </p>
        <p style="color: #475569; line-height: 1.6;">
          <strong>Important Instructions:</strong> Please aim to arrive at least 15 minutes before your scheduled time. If you have any previous eye medical records or wear prescription glasses, please bring them along.
        </p>
      `;
    } else if (status === "cancelled") {
      subject = `Appointment Update – Satome Eye Clinic`;
      headerText = `Appointment Cancelled`;
      emailIcon = `❌`;
      headerGradient = "linear-gradient(135deg, #f43f5e, #e11d48)";
      bodyText = `
        <p style="color: #475569; line-height: 1.6;">
          We are writing to inform you that your requested appointment slot for <strong>${serviceType}</strong> on ${new Date(appointmentDate).toLocaleDateString()} at ${appointmentTime} is unfortunately unavailable.
        </p>
        <p style="color: #475569; line-height: 1.6;">
          We apologize for any inconvenience this may cause. We kindly request that you select another available time by booking a new appointment on our website or contacting us directly via phone.
        </p>
        <div style="text-align: center; margin-top: 20px;">
          <a href="https://satomeeyeclinic.com/book" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
            Book a New Appointment
          </a>
        </div>
      `;
    } else {
      console.log(`Status "${status}" does not trigger an email update.`);
      return new Response(JSON.stringify({ success: true, message: "No email triggered for this status" }), {
        status: 200, headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    const formattedDate = new Date(appointmentDate).toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Satome Eye Clinic <onboarding@resend.dev>",
        to: [patientEmail],
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: ${headerGradient}; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">${emailIcon} ${headerText}</h1>
            </div>
            <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #1e293b; margin-top: 0;">Hello, ${patientName}</h2>
                ${bodyText}
                <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
                  <p style="margin: 8px 0;"><strong>Booking ID:</strong> ${bookingId}</p>
                  <p style="margin: 8px 0;"><strong>Service:</strong> ${serviceType}</p>
                  <p style="margin: 8px 0;"><strong>Date:</strong> ${formattedDate}</p>
                  <p style="margin: 8px 0;"><strong>Time:</strong> ${appointmentTime}</p>
                </div>
              </div>
              <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <h3 style="color: #065f46; margin-top: 0; font-size: 16px;">Clinic Details</h3>
                <p style="margin: 5px 0; color: #047857;">📞 Phone: ${clinicPhone}</p>
                <p style="margin: 5px 0; color: #047857;">📍 Address: ${clinicAddress}</p>
              </div>
              <p style="color: #64748b; font-size: 14px; text-align: center;">
                If you have any questions, please contact us directly.
              </p>
            </div>
          </div>
        `,
      }),
    });

    const result = await res.json();
    console.log("Resend API response:", JSON.stringify(result));

    if (!res.ok) {
      console.error("Resend update email failed:", result);
      return new Response(JSON.stringify({ success: false, error: result }), {
        status: 400, headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  } catch (error: any) {
    console.error("Error in send-booking-update:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
});

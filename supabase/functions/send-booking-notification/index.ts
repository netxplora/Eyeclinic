// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      bookingId,
      patientName,
      patientEmail,
      patientPhone,
      serviceType,
      appointmentDate,
      appointmentTime,
      additionalNotes,
      isWaitlist,
    } = body;

    console.log("Processing booking notification for:", bookingId);

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set!");
      return new Response(
        JSON.stringify({ success: false, error: "Email service not configured (missing API key)" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const adminEmail = "franklinbenstowe.001@gmail.com";
    const clinicPhone = "+234 805 907 0153";

    const formattedDate = new Date(appointmentDate).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const shortDate = new Date(appointmentDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    // ---- Send admin notification email via Resend REST API ----
    const adminTitle = isWaitlist ? "New Waitlist Request" : "New Appointment Request";
    const adminSubtitle = isWaitlist
      ? "Please review this waitlist entry and notify the patient when a slot opens."
      : "Please contact the patient to confirm their appointment.";

    const adminHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">${adminTitle}</h1>
        </div>
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1e293b; margin-top: 0;">Booking Details</h2>
            <p style="margin: 10px 0;"><strong>Booking ID:</strong> ${bookingId}</p>
            <p style="margin: 10px 0;"><strong>Patient Name:</strong> ${patientName}</p>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${patientEmail || "Not provided"}</p>
            <p style="margin: 10px 0;"><strong>Phone:</strong> ${patientPhone}</p>
            <p style="margin: 10px 0;"><strong>Service:</strong> ${serviceType}</p>
            <p style="margin: 10px 0;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin: 10px 0;"><strong>Time:</strong> ${appointmentTime || "Waitlist - Any Time"}</p>
            ${additionalNotes ? `<p style="margin: 10px 0;"><strong>Notes:</strong> ${additionalNotes}</p>` : ""}
          </div>
          <p style="color: #64748b; font-size: 14px; margin-top: 30px; text-align: center;">
            ${adminSubtitle}
          </p>
        </div>
      </div>
    `;

    const adminRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Satome Eye Clinic <onboarding@resend.dev>",
        to: [adminEmail],
        subject: isWaitlist ? `New Waitlist: ${patientName} - ${shortDate}` : `New Booking: ${bookingId}`,
        html: adminHtml,
      }),
    });

    const adminResult = await adminRes.json();
    console.log("Admin email response:", JSON.stringify(adminResult));

    if (!adminRes.ok) {
      console.error("Admin email failed:", adminResult);
      return new Response(
        JSON.stringify({ success: false, error: adminResult }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // ---- Send patient confirmation email (only if email provided) ----
    if (patientEmail) {
      const patientTitle = isWaitlist ? "You are on our Waitlist!" : "Your Appointment Request";
      const patientSubtitle = isWaitlist
        ? "We have added you to our waitlist for the date below and will notify you if a slot opens up."
        : "We have received your appointment request and will contact you shortly to confirm the details.";
      const whatHappensNext = isWaitlist
        ? "Our team will actively monitor cancellations. If a slot becomes available on your requested date, we will call you immediately."
        : "Our team will review your request and contact you within 24 hours to confirm your appointment time.";

      const patientHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Thank You, ${patientName}!</h1>
          </div>
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #1e293b; margin-top: 0;">${patientTitle}</h2>
              <p style="color: #475569; line-height: 1.6;">
                ${patientSubtitle}
              </p>
              <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 8px 0;"><strong>Booking ID:</strong> ${bookingId}</p>
                <p style="margin: 8px 0;"><strong>Service:</strong> ${serviceType}</p>
                <p style="margin: 8px 0;"><strong>Requested Date:</strong> ${formattedDate}</p>
                ${!isWaitlist ? `<p style="margin: 8px 0;"><strong>Requested Time:</strong> ${appointmentTime}</p>` : ""}
              </div>
              <p style="color: #475569; line-height: 1.6; margin-top: 20px;">
                <strong>What happens next?</strong><br>
                ${whatHappensNext}
              </p>
            </div>
            <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
              <h3 style="color: #065f46; margin-top: 0; font-size: 16px;">Contact Information</h3>
              <p style="margin: 5px 0; color: #047857;">Phone: ${clinicPhone}</p>
              <p style="margin: 5px 0; color: #047857;">Email: bookings@satomeeyeclinic.com</p>
              <p style="margin: 5px 0; color: #047857;">32 W Circular Rd, Tv Rd, beside licensing office, Use, Benin City 300271, Edo</p>
            </div>
            <p style="color: #64748b; font-size: 14px; text-align: center;">
              If you have any questions or need to make changes, please contact us directly.
            </p>
          </div>
        </div>
      `;

      const patientRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Satome Eye Clinic <onboarding@resend.dev>",
          to: [patientEmail],
          subject: isWaitlist ? `Waitlist Confirmation - ${bookingId}` : `Appointment Request Received - ${bookingId}`,
          html: patientHtml,
        }),
      });

      const patientResult = await patientRes.json();
      console.log("Patient email response:", JSON.stringify(patientResult));

      if (!patientRes.ok) {
        console.error("Patient email failed:", patientResult);
        return new Response(
          JSON.stringify({ success: false, error: patientResult }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notifications sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-booking-notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Internal Server Error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

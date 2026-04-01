import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendEmailRequest {
  recipientEmail: string;
  recipientName: string;
  subject: string;
  message: string;
  templateType?: string;
  bookingId?: string;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user is staff
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error("Authentication error:", authError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is staff using RPC
    const { data: isStaff, error: staffError } = await supabaseClient
      .rpc("is_staff", { _user_id: user.id });

    if (staffError || !isStaff) {
      console.error("Staff verification failed:", staffError);
      return new Response(
        JSON.stringify({ error: "Only staff members can send emails" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { recipientEmail, recipientName, subject, message, bookingId }: SendEmailRequest = await req.json();

    // Validate required fields
    if (!recipientEmail || !recipientName || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: recipientEmail, recipientName, subject, message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Sending email to ${recipientEmail} with subject: ${subject}`);

    const emailHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
  <div style="background: linear-gradient(135deg, #0891b2 0%, #0e7490 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Hephzibah Eye Care</h1>
    <p style="color: #e0f2fe; margin: 10px 0 0 0; font-size: 14px;">Your Vision, Our Priority</p>
  </div>
  
  <div style="background-color: #ffffff; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <p style="font-size: 18px; margin-bottom: 20px;">Dear <strong>${recipientName}</strong>,</p>
    
    <div style="font-size: 16px; color: #4a5568; white-space: pre-wrap;">${message}</div>
    
    <div style="margin-top: 40px; padding-top: 30px; border-top: 2px solid #e2e8f0;">
      <p style="margin: 0; font-size: 14px; color: #64748b;">Best regards,</p>
      <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: 600; color: #0891b2;">The Hephzibah Eye Care Team</p>
    </div>
  </div>
  
  <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
    <p style="margin: 0;">Tombia St, opposite Mandela car wash</p>
    <p style="margin: 5px 0 0 0;">GRA Phase 3, Port Harcourt 500272, Rivers State, Nigeria</p>
    <p style="margin: 10px 0 0 0;">
      <a href="tel:+2347051590488" style="color: #0891b2; text-decoration: none;">+234 705 159 0488</a>
    </p>
  </div>
</body>
</html>`;

    // Send email using Resend API
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Hephzibah Eye Care <onboarding@resend.dev>",
        to: [recipientEmail],
        subject: subject,
        html: emailHtml,
      }),
    });

    const emailResponse = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", emailResponse);
      throw new Error(emailResponse.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailResponse);

    // Log the activity if bookingId is provided
    if (bookingId) {
      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      await supabaseAdmin.from("activity_logs").insert({
        staff_id: user.id,
        booking_id: bookingId,
        action_type: "email_sent",
        new_value: subject,
        notes: `Email sent to ${recipientEmail}`
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-patient-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send email" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

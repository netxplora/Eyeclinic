import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.0";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify the requesting user is authenticated and is staff
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user is staff
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: "Unauthorized. Staff access required." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate request body
    const requestSchema = z.object({
      bookingId: z.string().uuid(),
      newDate: z.string(),
      newTime: z.string(),
      reason: z.string().optional()
    });

    const { bookingId, newDate, newTime, reason } = requestSchema.parse(await req.json());

    // Get current booking details
    const { data: currentBooking, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (fetchError || !currentBooking) {
      return new Response(
        JSON.stringify({ error: "Booking not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const oldDate = currentBooking.appointment_date;
    const oldTime = currentBooking.appointment_time;

    // Update the booking
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ 
        appointment_date: newDate,
        appointment_time: newTime,
        status: 'confirmed'
      })
      .eq("id", bookingId);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: "Failed to update booking" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log the activity
    await supabase.from("activity_logs").insert({
      booking_id: bookingId,
      staff_id: user.id,
      action_type: "reschedule",
      old_value: `${oldDate} at ${oldTime}`,
      new_value: `${newDate} at ${newTime}`,
      notes: reason || "Rescheduled by staff"
    });

    // Send email notification to patient
    if (currentBooking.patient_email) {
      const adminEmail = "bookings@hephzibahvisioncare.com";
      const clinicPhone = "+234 705 159 0488";

      await resend.emails.send({
        from: "Hephzibah Vision Care <bookings@hephzibahvisioncare.com>",
        to: [currentBooking.patient_email],
        subject: `Appointment Rescheduled - ${currentBooking.booking_id}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Appointment Rescheduled</h1>
            </div>
            
            <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <p style="color: #475569; line-height: 1.6;">
                  Dear ${currentBooking.patient_name},
                </p>
                <p style="color: #475569; line-height: 1.6;">
                  Your appointment has been rescheduled. Here are the updated details:
                </p>
                
                <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 6px;">
                  <h3 style="color: #991b1b; margin-top: 0; font-size: 14px;">Previous Schedule:</h3>
                  <p style="margin: 5px 0; color: #991b1b;">📅 ${new Date(oldDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p style="margin: 5px 0; color: #991b1b;">⏰ ${oldTime}</p>
                </div>

                <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 6px;">
                  <h3 style="color: #065f46; margin-top: 0; font-size: 14px;">New Schedule:</h3>
                  <p style="margin: 5px 0; color: #047857;">📅 ${new Date(newDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p style="margin: 5px 0; color: #047857;">⏰ ${newTime}</p>
                </div>

                <div style="background: #f1f5f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
                  <p style="margin: 5px 0;"><strong>Booking ID:</strong> ${currentBooking.booking_id}</p>
                  <p style="margin: 5px 0;"><strong>Service:</strong> ${currentBooking.service_type}</p>
                  ${reason ? `<p style="margin: 5px 0;"><strong>Reason:</strong> ${reason}</p>` : ''}
                </div>
              </div>
              
              <div style="background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
                <h3 style="color: #065f46; margin-top: 0; font-size: 16px;">Contact Information</h3>
                <p style="margin: 5px 0; color: #047857;">📞 Phone: ${clinicPhone}</p>
                <p style="margin: 5px 0; color: #047857;">📧 Email: ${adminEmail}</p>
                <p style="margin: 5px 0; color: #047857;">📍 Tombia St, opposite Mandela car wash, GRA PHASE 3</p>
              </div>
              
              <p style="color: #64748b; font-size: 14px; text-align: center;">
                If you have any questions or concerns about this change, please contact us.
              </p>
            </div>
          </div>
        `,
      });
    }

    console.log(`Successfully rescheduled booking ${bookingId}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Booking rescheduled successfully and notification sent"
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in reschedule-booking function:", error);
    
    if (error.name === "ZodError") {
      return new Response(
        JSON.stringify({ 
          error: "Validation error",
          details: error.errors 
        }),
        {
          status: 400,
          headers: { 
            "Content-Type": "application/json", 
            ...corsHeaders 
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: error.message || "Internal server error" 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);

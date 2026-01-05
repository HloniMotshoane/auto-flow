import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  caseId: string;
  stageId: string;
  stageHistoryId: string;
  notificationType: "email" | "whatsapp" | "both";
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { caseId, stageId, stageHistoryId, notificationType }: NotificationRequest = await req.json();

    console.log("Processing notification request:", { caseId, stageId, notificationType });

    // Fetch case with customer and vehicle details
    const { data: caseData, error: caseError } = await supabase
      .from("cases")
      .select(`
        *,
        customer:customers(name, email, phone, whatsapp_number),
        vehicle:vehicles(registration_number, make, model, year)
      `)
      .eq("id", caseId)
      .single();

    if (caseError || !caseData) {
      console.error("Error fetching case:", caseError);
      throw new Error("Case not found");
    }

    // Fetch stage details
    const { data: stageData, error: stageError } = await supabase
      .from("workflow_stages")
      .select("name, notification_template, notify_customer")
      .eq("id", stageId)
      .single();

    if (stageError || !stageData) {
      console.error("Error fetching stage:", stageError);
      throw new Error("Stage not found");
    }

    const customer = caseData.customer;
    const vehicle = caseData.vehicle;

    if (!customer) {
      console.log("No customer linked to case, skipping notification");
      return new Response(
        JSON.stringify({ success: false, reason: "No customer linked" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Build notification message
    let message = stageData.notification_template || 
      `Your vehicle ${vehicle?.registration_number || ""} has moved to: ${stageData.name}`;
    
    // Replace variables
    message = message
      .replace("{customer_name}", customer.name || "Valued Customer")
      .replace("{vehicle_reg}", vehicle?.registration_number || "your vehicle")
      .replace("{vehicle_make}", vehicle?.make || "")
      .replace("{vehicle_model}", vehicle?.model || "");

    const results: { email?: boolean; whatsapp?: boolean } = {};

    // Send Email notification
    if ((notificationType === "email" || notificationType === "both") && customer.email) {
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      
      if (resendApiKey) {
        try {
          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Workshop Updates <onboarding@resend.dev>",
              to: [customer.email],
              subject: `Vehicle Update: ${stageData.name}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #3B82F6;">Vehicle Status Update</h2>
                  <p>Dear ${customer.name || "Valued Customer"},</p>
                  <p>${message}</p>
                  <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <strong>Vehicle:</strong> ${vehicle?.make || ""} ${vehicle?.model || ""}<br/>
                    <strong>Registration:</strong> ${vehicle?.registration_number || "N/A"}<br/>
                    <strong>Current Stage:</strong> ${stageData.name}
                  </div>
                  <p>Thank you for your business.</p>
                </div>
              `,
            }),
          });

          if (emailResponse.ok) {
            results.email = true;
            console.log("Email sent successfully");
          } else {
            const errorText = await emailResponse.text();
            console.error("Email send failed:", errorText);
            results.email = false;
          }
        } catch (emailError) {
          console.error("Email error:", emailError);
          results.email = false;
        }
      } else {
        console.log("RESEND_API_KEY not configured, skipping email");
        results.email = false;
      }
    }

    // Send WhatsApp notification
    if ((notificationType === "whatsapp" || notificationType === "both") && 
        (customer.whatsapp_number || customer.phone)) {
      const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
      const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
      const twilioWhatsappNumber = Deno.env.get("TWILIO_WHATSAPP_NUMBER");

      if (twilioAccountSid && twilioAuthToken && twilioWhatsappNumber) {
        try {
          const toNumber = customer.whatsapp_number || customer.phone;
          const formattedTo = toNumber?.startsWith("+") ? toNumber : `+${toNumber}`;

          const twilioResponse = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
            {
              method: "POST",
              headers: {
                "Authorization": `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                From: `whatsapp:${twilioWhatsappNumber}`,
                To: `whatsapp:${formattedTo}`,
                Body: `🚗 *Vehicle Update*\n\n${message}\n\nVehicle: ${vehicle?.make || ""} ${vehicle?.model || ""}\nReg: ${vehicle?.registration_number || "N/A"}\nStage: ${stageData.name}`,
              }),
            }
          );

          if (twilioResponse.ok) {
            results.whatsapp = true;
            console.log("WhatsApp message sent successfully");
          } else {
            const errorText = await twilioResponse.text();
            console.error("WhatsApp send failed:", errorText);
            results.whatsapp = false;
          }
        } catch (whatsappError) {
          console.error("WhatsApp error:", whatsappError);
          results.whatsapp = false;
        }
      } else {
        console.log("Twilio credentials not configured, skipping WhatsApp");
        results.whatsapp = false;
      }
    }

    // Update stage_history with notification status
    const notificationSent = results.email || results.whatsapp;
    if (notificationSent) {
      await supabase
        .from("stage_history")
        .update({ 
          notified_customer: true,
          notification_sent_at: new Date().toISOString()
        })
        .eq("id", stageHistoryId);
    }

    console.log("Notification results:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Error in send-stage-notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

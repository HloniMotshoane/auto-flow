import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotifyRequest {
  quotationId: string;
  quoteNumber: string;
  customerName: string;
  vehicleDetails: string;
  caseNumber?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("notify-estimators-new-quote function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { quotationId, quoteNumber, customerName, vehicleDetails, caseNumber }: NotifyRequest = await req.json();

    console.log("Received request:", { quotationId, quoteNumber, customerName, vehicleDetails, caseNumber });

    // Fetch all active estimators with valid email addresses
    const { data: estimators, error: estimatorsError } = await supabase
      .from("profiles")
      .select("id, user_id, first_name, last_name, email, job_role")
      .eq("is_active", true)
      .ilike("job_role", "%estimator%")
      .not("email", "is", null);

    if (estimatorsError) {
      console.error("Error fetching estimators:", estimatorsError);
      throw estimatorsError;
    }

    console.log(`Found ${estimators?.length || 0} estimators to notify`);

    if (!estimators || estimators.length === 0) {
      console.log("No estimators found to notify");
      return new Response(
        JSON.stringify({ success: true, message: "No estimators to notify" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send emails to all estimators
    const emailPromises = estimators.map(async (estimator) => {
      if (!estimator.email) return null;

      const estimatorName = [estimator.first_name, estimator.last_name].filter(Boolean).join(" ") || "Estimator";
      
      try {
        const emailResponse = await resend.emails.send({
          from: "Workshop Quotes <onboarding@resend.dev>",
          to: [estimator.email],
          subject: `New Quote Request: ${quoteNumber} - ${vehicleDetails}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #3B82F6, #1D4ED8); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
                .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
                .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6; }
                .detail-row { margin: 10px 0; }
                .label { font-weight: 600; color: #6b7280; }
                .value { color: #111827; }
                .cta { text-align: center; margin: 30px 0; }
                .button { background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; }
                .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">New Quote Request</h1>
                  <p style="margin: 10px 0 0 0; opacity: 0.9;">A new quotation has been submitted</p>
                </div>
                <div class="content">
                  <p>Hi ${estimatorName},</p>
                  <p>A new quote request has been submitted and is awaiting estimation.</p>
                  
                  <div class="details">
                    <div class="detail-row">
                      <span class="label">Quote Number:</span>
                      <span class="value">${quoteNumber}</span>
                    </div>
                    ${caseNumber ? `<div class="detail-row">
                      <span class="label">Case Reference:</span>
                      <span class="value">${caseNumber}</span>
                    </div>` : ''}
                    <div class="detail-row">
                      <span class="label">Customer:</span>
                      <span class="value">${customerName}</span>
                    </div>
                    <div class="detail-row">
                      <span class="label">Vehicle:</span>
                      <span class="value">${vehicleDetails}</span>
                    </div>
                  </div>
                  
                  <p>Please log in to the system to review and assign yourself to this quote.</p>
                  
                  <div class="cta">
                    <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app') || '#'}/estimators" class="button">
                      View Unquoted Jobs
                    </a>
                  </div>
                </div>
                <div class="footer">
                  <p>This is an automated notification from your Workshop Management System.</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });
        
        console.log(`Email sent to ${estimator.email}:`, emailResponse);
        return { email: estimator.email, success: true };
      } catch (emailError) {
        console.error(`Failed to send email to ${estimator.email}:`, emailError);
        return { email: estimator.email, success: false, error: emailError };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter(r => r?.success).length;
    const failCount = results.filter(r => r && !r.success).length;

    console.log(`Email notification complete: ${successCount} sent, ${failCount} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notified ${successCount} estimators`,
        details: { sent: successCount, failed: failCount }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in notify-estimators-new-quote function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);

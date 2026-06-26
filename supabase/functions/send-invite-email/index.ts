import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const {
      email,
      invite_code,
      association_name,
      role,
    } = await req.json();

    const inviteUrl = `https://vote.principledcam.com/invite/${invite_code}`;

    const result = await resend.emails.send({
      from: "Principled CAM <noreply@principledcam.com>",
      to: email,
      subject: `You're invited to ${association_name}`,
      html: `
        <h2>You've been invited!</h2>

        <p>You have been invited to join <strong>${association_name}</strong>.</p>

        <p>Role: ${role}</p>

        <p>
          <a href="${inviteUrl}">
            Accept Invitation
          </a>
        </p>

        <p>This invitation expires in 7 days.</p>
      `,
    });

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );

  } catch (err) {
    console.error(err);

    return new Response(
      JSON.stringify({
        error: err.message,
        stack: err.stack,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
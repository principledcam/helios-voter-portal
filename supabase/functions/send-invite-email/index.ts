import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend";

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!);

serve(async (req) => {
  try {
    const {
      email,
      invite_code,
      association_name,
      role,
    } = await req.json();

    if (!email || !invite_code || !association_name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    const inviteUrl = `https://vote.principledcam.com/invite/${invite_code}`;

    const { data, error } = await resend.emails.send({
      from: "Principled CAM <noreply@principledcam.com>",
      to: email,
      subject: `You've been invited to ${association_name}`,
      html: `
        <div style="font-family:Arial;padding:20px">
          <h2>You're Invited</h2>

          <p>Hello,</p>

          <p>
            You have been invited to join the
            <strong>${association_name}</strong> voting portal.
          </p>

          <p><strong>Role:</strong> ${role}</p>

          <p>
            Click below to accept your invitation:
          </p>

          <a href="${inviteUrl}"
             style="display:inline-block;
                    padding:10px 15px;
                    background:#111;
                    color:#fff;
                    text-decoration:none;
                    border-radius:6px;">
            Accept Invitation
          </a>

          <p style="margin-top:20px;color:#666;font-size:12px">
            This invitation expires in 7 days.
          </p>

          <hr />

          <p style="font-size:12px;color:#888">
            Principled CAM Voting System
          </p>
        </div>
      `,
      text: `
You have been invited to ${association_name}.

Role: ${role}

Accept your invitation:
${inviteUrl}

This invitation expires in 7 days.
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500 }
      );
    }

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
    });

  } catch (err: any) {
    console.error("Function error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
});
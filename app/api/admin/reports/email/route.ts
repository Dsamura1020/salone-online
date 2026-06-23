import { jsonError, jsonOk } from "@/lib/api/response";
import { requireAdmin } from "@/lib/auth/auth";
import { z } from "zod";

const emailReportSchema = z.object({
  recipient: z.string().email("Enter a valid email address"),
  subject: z.string().min(1, "Subject is required").max(200),
  message: z.string().max(2000).optional(),
  attachments: z.array(z.string()).optional(),
});

export async function POST(request: Request) {
  const session = await requireAdmin();
  if (!session) {
    return jsonError("Admin access required", 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = emailReportSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Invalid request", 400);
  }

  const { recipient, subject, message, attachments } = parsed.data;

  try {
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS?.replace(/\s+/g, "");

    if (emailUser && emailPass) {
      const nodemailer = await import("nodemailer");
      const transporter = nodemailer.default.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: { user: emailUser, pass: emailPass },
      });

      await transporter.sendMail({
        from: `"SaloneOnline Reports" <${emailUser}>`,
        to: recipient,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; color: #0f172a;">
            <h2 style="color: #10206f;">SaloneOnline — Analytics Report</h2>
            <p>${message ?? "Please find the requested analytics report."}</p>
            ${
              attachments && attachments.length > 0
                ? `<p><strong>Requested reports:</strong> ${attachments.join(", ")}</p>`
                : ""
            }
            <hr>
            <p style="color: #64748b; font-size: 12px;">
              Sent from SaloneOnline Admin Dashboard · ${new Date().toLocaleString()}
            </p>
          </div>
        `,
        text: `${message ?? "Please find the requested analytics report."}\n\nSent from SaloneOnline Admin Dashboard.`,
      });
    } else if (process.env.NODE_ENV !== "production") {
      console.info(`[Report Email] To: ${recipient} | Subject: ${subject}`);
    } else {
      return jsonError("Email delivery is not configured", 500);
    }

    return jsonOk({ sent: true, recipient });
  } catch {
    return jsonError("Failed to send email. Please try again.", 500);
  }
}

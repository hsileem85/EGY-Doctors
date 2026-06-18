// Replit Resend integration via @replit/connectors-sdk
import { ReplitConnectors } from "@replit/connectors-sdk";

const connectors = new ReplitConnectors();
const FROM = "EGY Doctors <onboarding@resend.dev>";

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const response = await connectors.proxy("resend", "/emails", {
    method: "POST",
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend error ${response.status}: ${body}`);
  }
}

export async function sendDoctorPendingEmail(to: string, doctorName: string): Promise<void> {
  try {
    await sendEmail(
      to,
      "Your EGY Doctors account is under review",
      `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#fff">
        <div style="text-align:center;margin-bottom:24px">
          <h1 style="color:#0F172A;font-size:24px;margin:0">EGY Doctors</h1>
        </div>
        <h2 style="color:#0F172A;font-size:20px">Hello, ${doctorName}!</h2>
        <p style="color:#475569;line-height:1.6">
          Thank you for registering on <strong>EGY Doctors</strong>. Your account has been created successfully and is now <strong>pending review</strong> by our admin team.
        </p>
        <div style="background:#FEF9F0;border:1px solid #D4A853;border-radius:8px;padding:16px;margin:24px 0">
          <p style="color:#92400E;margin:0;font-size:14px">
            ⏳ Our team typically reviews applications within 1–2 business days. You will receive another email once your account is approved.
          </p>
        </div>
        <p style="color:#475569;line-height:1.6">
          In the meantime, you can log in and complete your profile setup so everything is ready when you are approved.
        </p>
        <p style="color:#94A3B8;font-size:12px;margin-top:32px;border-top:1px solid #E2E8F0;padding-top:16px">
          EGY Doctors — Egypt's trusted medical directory
        </p>
      </div>
      `
    );
  } catch {
    // Email failures should not block signup
  }
}

export async function sendDoctorApprovedEmail(to: string, doctorName: string): Promise<void> {
  try {
    await sendEmail(
      to,
      "🎉 Your EGY Doctors account has been approved!",
      `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#fff">
        <div style="text-align:center;margin-bottom:24px">
          <h1 style="color:#0F172A;font-size:24px;margin:0">EGY Doctors</h1>
        </div>
        <h2 style="color:#0F172A;font-size:20px">Welcome, Dr. ${doctorName}!</h2>
        <p style="color:#475569;line-height:1.6">
          Great news — your <strong>EGY Doctors</strong> account has been <strong>approved</strong>! You can now access your full dashboard and start receiving appointments from patients.
        </p>
        <div style="background:#F0FDF4;border:1px solid #22C55E;border-radius:8px;padding:16px;margin:24px 0">
          <p style="color:#166534;margin:0;font-size:14px">
            ✅ Your profile is now live and visible to patients searching for doctors in your specialty.
          </p>
        </div>
        <div style="text-align:center;margin:32px 0">
          <a href="https://egydoctors.com/dashboard" style="background:#D4A853;color:#0F172A;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block">
            Go to My Dashboard
          </a>
        </div>
        <p style="color:#94A3B8;font-size:12px;margin-top:32px;border-top:1px solid #E2E8F0;padding-top:16px">
          EGY Doctors — Egypt's trusted medical directory
        </p>
      </div>
      `
    );
  } catch {
    // Email failures should not block the approval response
  }
}

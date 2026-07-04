// Replit Resend integration via @replit/connectors-sdk
import { ReplitConnectors } from "@replit/connectors-sdk";

const connectors = new ReplitConnectors();
const FROM = "EGY Doctors <noreply@egydoctors.com>";

type Attachment = { filename: string; content: string };

async function sendEmail(
  to: string,
  subject: string,
  html: string,
  attachments?: Attachment[],
): Promise<void> {
  const payload: Record<string, unknown> = { from: FROM, to, subject, html };
  if (attachments?.length) payload.attachments = attachments;
  const response = await connectors.proxy("resend", "/emails", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend error ${response.status}: ${body}`);
  }
}

const FOOTER = `<p style="color:#94A3B8;font-size:12px;margin-top:32px;border-top:1px solid #E2E8F0;padding-top:16px;text-align:center">EGY Doctors — Egypt's trusted medical directory</p>`;
const LOGO = `<div style="text-align:center;margin-bottom:28px"><h1 style="color:#0F172A;font-size:24px;margin:0">EGY<span style="color:#D4A853"> Doctors</span></h1></div>`;

export async function sendContactEmail(data: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}): Promise<void> {
  const { name, email, phone, subject, message } = data;
  const subjectLine = subject ? `[Contact] ${subject}` : "[Contact] New message from EGY Doctors";
  await sendEmail(
    "support@egydoctors.com",
    subjectLine,
    `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#fff">
      <div style="text-align:center;margin-bottom:24px">
        <h1 style="color:#0F172A;font-size:24px;margin:0">EGY<span style="color:#D4A853"> Doctors</span></h1>
      </div>
      <h2 style="color:#0F172A;font-size:18px;margin-bottom:4px">New Contact Form Message</h2>
      <p style="color:#64748B;font-size:13px;margin-bottom:24px">Submitted via egydoctors.com</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr>
          <td style="padding:10px 12px;background:#F8FAFC;border:1px solid #E2E8F0;font-weight:600;color:#374151;width:120px">Name</td>
          <td style="padding:10px 12px;border:1px solid #E2E8F0;color:#1E293B">${name}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;background:#F8FAFC;border:1px solid #E2E8F0;font-weight:600;color:#374151">Email</td>
          <td style="padding:10px 12px;border:1px solid #E2E8F0;color:#1E293B"><a href="mailto:${email}" style="color:#D4A853">${email}</a></td>
        </tr>
        ${phone ? `<tr>
          <td style="padding:10px 12px;background:#F8FAFC;border:1px solid #E2E8F0;font-weight:600;color:#374151">Phone</td>
          <td style="padding:10px 12px;border:1px solid #E2E8F0;color:#1E293B">${phone}</td>
        </tr>` : ""}
        ${subject ? `<tr>
          <td style="padding:10px 12px;background:#F8FAFC;border:1px solid #E2E8F0;font-weight:600;color:#374151">Subject</td>
          <td style="padding:10px 12px;border:1px solid #E2E8F0;color:#1E293B">${subject}</td>
        </tr>` : ""}
      </table>
      <div style="margin-top:20px;padding:16px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px">
        <p style="font-weight:600;color:#374151;margin:0 0 8px">Message</p>
        <p style="color:#1E293B;white-space:pre-wrap;margin:0;line-height:1.6">${message}</p>
      </div>
      <p style="color:#94A3B8;font-size:12px;margin-top:32px;border-top:1px solid #E2E8F0;padding-top:16px">
        EGY Doctors — Egypt's trusted medical directory
      </p>
    </div>
    `
  );
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

export async function sendPasswordResetEmail(to: string, code: string): Promise<void> {
  await sendEmail(
      to,
      "Your EGY Doctors password reset code",
      `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#fff">
        <div style="text-align:center;margin-bottom:24px">
          <h1 style="color:#0F172A;font-size:24px;margin:0">EGY<span style="color:#D4A853"> Doctors</span></h1>
        </div>
        <h2 style="color:#0F172A;font-size:20px;margin-bottom:8px">Reset Your Password</h2>
        <p style="color:#475569;line-height:1.6;margin-bottom:24px">
          We received a request to reset the password for your EGY Doctors account.
          Use the code below to set a new password. This code expires in <strong>15 minutes</strong>.
        </p>
        <div style="background:#0F172A;border-radius:12px;padding:28px;text-align:center;margin:24px 0">
          <p style="color:#94A3B8;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;margin:0 0 12px">Your Reset Code</p>
          <p style="color:#D4A853;font-size:38px;font-weight:800;letter-spacing:0.25em;margin:0;font-family:monospace">${code}</p>
        </div>
        <p style="color:#475569;font-size:14px;line-height:1.6">
          If you didn't request a password reset, you can safely ignore this email — your password will not change.
        </p>
        <p style="color:#94A3B8;font-size:12px;margin-top:32px;border-top:1px solid #E2E8F0;padding-top:16px">
          EGY Doctors — Egypt's trusted medical directory
        </p>
      </div>
      `
    );
}

/* ── Appointment notification helpers ── */

type ApptEmailData = {
  to: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  clinicName?: string;
  lang?: "en" | "ar";
};

function apptDetailsTable(clinicRow: string) {
  return `<table style="width:100%;border-collapse:collapse;font-size:14px">${clinicRow}</table>`;
}

export async function sendAppointmentConfirmedEmail(data: ApptEmailData): Promise<void> {
  const { to, patientName, doctorName, date, time, clinicName, lang } = data;
  const clinicRowAr = clinicName ? `<tr><td style="padding:6px 0;color:#374151;font-weight:600">العيادة</td><td style="padding:6px 0;color:#1E293B">${clinicName}</td></tr>` : "";
  const clinicRowEn = clinicName ? `<tr><td style="padding:6px 0;color:#374151;font-weight:600;width:100px">Clinic</td><td style="padding:6px 0;color:#1E293B">${clinicName}</td></tr>` : "";
  const detailsAr = apptDetailsTable(`<tr><td style="padding:6px 0;color:#374151;font-weight:600">الطبيب</td><td style="padding:6px 0;color:#1E293B">د. ${doctorName}</td></tr><tr><td style="padding:6px 0;color:#374151;font-weight:600">التاريخ</td><td style="padding:6px 0;color:#1E293B">${date}</td></tr><tr><td style="padding:6px 0;color:#374151;font-weight:600">الوقت</td><td style="padding:6px 0;color:#1E293B">${time}</td></tr>${clinicRowAr}`);
  const detailsEn = apptDetailsTable(`<tr><td style="padding:6px 0;color:#374151;font-weight:600;width:100px">Doctor</td><td style="padding:6px 0;color:#1E293B">Dr. ${doctorName}</td></tr><tr><td style="padding:6px 0;color:#374151;font-weight:600">Date</td><td style="padding:6px 0;color:#1E293B">${date}</td></tr><tr><td style="padding:6px 0;color:#374151;font-weight:600">Time</td><td style="padding:6px 0;color:#1E293B">${time}</td></tr>${clinicRowEn}`);

  const arBlock = `<div dir="rtl" style="text-align:right;margin-bottom:32px"><h2 style="color:#0F172A;font-size:20px">مرحباً، ${patientName}!</h2><p style="color:#475569;line-height:1.8">أخبار رائعة — تم <strong>تأكيد</strong> موعدك مع <strong>د. ${doctorName}</strong>.</p><div style="background:#F0FDF4;border:1px solid #22C55E;border-radius:8px;padding:20px;margin:20px 0">${detailsAr}</div><p style="color:#475569;font-size:14px;line-height:1.8">يُرجى الحضور قبل 10 دقائق من موعدك. للإلغاء أو إعادة الجدولة، تواصل مع العيادة مباشرةً.</p></div>`;
  const enBlock = `<div dir="ltr" style="text-align:left"><h2 style="color:#0F172A;font-size:20px">Hello, ${patientName}!</h2><p style="color:#475569;line-height:1.6">Great news — your appointment with <strong>Dr. ${doctorName}</strong> has been <strong>confirmed</strong>.</p><div style="background:#F0FDF4;border:1px solid #22C55E;border-radius:8px;padding:20px;margin:20px 0">${detailsEn}</div><p style="color:#475569;font-size:14px;line-height:1.6">Please arrive 10 minutes before your scheduled time. If you need to cancel or reschedule, contact the clinic directly.</p></div>`;

  const content = lang === "ar" ? arBlock : lang === "en" ? enBlock : `${arBlock}<hr style="border:none;border-top:1px solid #E2E8F0;margin:0 0 28px" />${enBlock}`;
  const subject = lang === "ar" ? "✅ تم تأكيد موعدك — EGY Doctors" : lang === "en" ? "✅ Your appointment has been confirmed — EGY Doctors" : "✅ تم تأكيد موعدك / Your appointment has been confirmed — EGY Doctors";

  try {
    await sendEmail(to, subject, `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#fff">${LOGO}${content}${FOOTER}</div>`);
  } catch {
    // Email failures should not block confirmation
  }
}

export async function sendAppointmentCancelledEmail(data: ApptEmailData): Promise<void> {
  const { to, patientName, doctorName, date, time, clinicName, lang } = data;
  const clinicRowAr = clinicName ? `<tr><td style="padding:6px 0;color:#374151;font-weight:600">العيادة</td><td style="padding:6px 0;color:#1E293B">${clinicName}</td></tr>` : "";
  const clinicRowEn = clinicName ? `<tr><td style="padding:6px 0;color:#374151;font-weight:600;width:100px">Clinic</td><td style="padding:6px 0;color:#1E293B">${clinicName}</td></tr>` : "";
  const detailsAr = apptDetailsTable(`<tr><td style="padding:6px 0;color:#374151;font-weight:600">الطبيب</td><td style="padding:6px 0;color:#1E293B">د. ${doctorName}</td></tr><tr><td style="padding:6px 0;color:#374151;font-weight:600">التاريخ</td><td style="padding:6px 0;color:#1E293B">${date}</td></tr><tr><td style="padding:6px 0;color:#374151;font-weight:600">الوقت</td><td style="padding:6px 0;color:#1E293B">${time}</td></tr>${clinicRowAr}`);
  const detailsEn = apptDetailsTable(`<tr><td style="padding:6px 0;color:#374151;font-weight:600;width:100px">Doctor</td><td style="padding:6px 0;color:#1E293B">Dr. ${doctorName}</td></tr><tr><td style="padding:6px 0;color:#374151;font-weight:600">Date</td><td style="padding:6px 0;color:#1E293B">${date}</td></tr><tr><td style="padding:6px 0;color:#374151;font-weight:600">Time</td><td style="padding:6px 0;color:#1E293B">${time}</td></tr>${clinicRowEn}`);

  const ctaAr = `<div style="text-align:center;margin:24px 0"><a href="https://egydoctors.com" style="background:#D4A853;color:#0F172A;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block">ابحث عن طبيب آخر</a></div>`;
  const ctaEn = `<div style="text-align:center;margin:24px 0"><a href="https://egydoctors.com" style="background:#D4A853;color:#0F172A;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block">Find Another Doctor</a></div>`;

  const arBlock = `<div dir="rtl" style="text-align:right;margin-bottom:32px"><h2 style="color:#0F172A;font-size:20px">مرحباً، ${patientName}!</h2><p style="color:#475569;line-height:1.8">نأسف لإبلاغك — لم يتمكن <strong>د. ${doctorName}</strong> من تأكيد طلب حجزك في الوقت الحالي.</p><div style="background:#FEF2F2;border:1px solid #F87171;border-radius:8px;padding:20px;margin:20px 0">${detailsAr}</div><p style="color:#475569;font-size:14px;line-height:1.8">يمكنك البحث عن طبيب آخر أو اختيار موعد مختلف.</p>${ctaAr}</div>`;
  const enBlock = `<div dir="ltr" style="text-align:left"><h2 style="color:#0F172A;font-size:20px">Hello, ${patientName}!</h2><p style="color:#475569;line-height:1.6">We're sorry — your appointment request with <strong>Dr. ${doctorName}</strong> could not be confirmed at this time.</p><div style="background:#FEF2F2;border:1px solid #F87171;border-radius:8px;padding:20px;margin:20px 0">${detailsEn}</div><p style="color:#475569;font-size:14px;line-height:1.6">You're welcome to search for another available doctor or try booking a different time slot.</p>${ctaEn}</div>`;

  const content = lang === "ar" ? arBlock : lang === "en" ? enBlock : `${arBlock}<hr style="border:none;border-top:1px solid #E2E8F0;margin:0 0 28px" />${enBlock}`;
  const subject = lang === "ar" ? "❌ لم يتم تأكيد طلب حجزك — EGY Doctors" : lang === "en" ? "❌ Your appointment request was not confirmed — EGY Doctors" : "❌ لم يتم تأكيد طلب حجزك / Your appointment request was not confirmed — EGY Doctors";

  try {
    await sendEmail(to, subject, `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#fff">${LOGO}${content}${FOOTER}</div>`);
  } catch {
    // Email failures should not block the cancellation response
  }
}

/* ── New-post follower notification ── */

type NewPostEmailData = {
  to: string;
  followerName: string;
  doctorName: string;
  postTitle?: string;
  postType: "article" | "tip" | "video";
  postId: number;
  lang: "en" | "ar";
};

const typeLabels = {
  en: { article: "article", tip: "health tip", video: "video" },
  ar: { article: "مقال", tip: "نصيحة صحية", video: "فيديو" },
};

export async function sendNewPostNotificationEmail(data: NewPostEmailData): Promise<void> {
  const { to, followerName, doctorName, postTitle, postType, postId, lang } = data;
  const base = process.env.APP_URL ?? "https://egydoctors.com";
  const postUrl = `${base}/magazine?postId=${postId}`;
  const label = typeLabels[lang][postType];

  const subject = lang === "ar"
    ? `📣 د. ${doctorName} نشر ${label} جديداً — EGY Doctors`
    : `📣 Dr. ${doctorName} published a new ${label} — EGY Doctors`;

  const bodyAr = `
    <div dir="rtl" style="text-align:right">
      <h2 style="color:#0F172A;font-size:20px">مرحباً، ${followerName}!</h2>
      <p style="color:#475569;line-height:1.8">
        نشر <strong>د. ${doctorName}</strong>، الذي تتابعه، ${label} جديداً على منصة إيجي دكتورز.
      </p>
      ${postTitle ? `<div style="background:#FEF9F0;border:1px solid #D4A853;border-radius:8px;padding:16px;margin:20px 0"><p style="color:#92400E;margin:0;font-weight:600">${postTitle}</p></div>` : ""}
      <div style="text-align:center;margin:28px 0">
        <a href="${postUrl}" style="background:#D4A853;color:#0F172A;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block">
          اقرأ الآن
        </a>
      </div>
    </div>`;

  const bodyEn = `
    <div dir="ltr" style="text-align:left">
      <h2 style="color:#0F172A;font-size:20px">Hello, ${followerName}!</h2>
      <p style="color:#475569;line-height:1.6">
        <strong>Dr. ${doctorName}</strong>, whom you follow, just published a new ${label} on EGY Doctors.
      </p>
      ${postTitle ? `<div style="background:#FEF9F0;border:1px solid #D4A853;border-radius:8px;padding:16px;margin:20px 0"><p style="color:#92400E;margin:0;font-weight:600">${postTitle}</p></div>` : ""}
      <div style="text-align:center;margin:28px 0">
        <a href="${postUrl}" style="background:#D4A853;color:#0F172A;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block">
          Read Now
        </a>
      </div>
    </div>`;

  const content = lang === "ar" ? bodyAr : bodyEn;
  await sendEmail(to, subject,
    `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#fff">${LOGO}${content}${FOOTER}</div>`
  );
}

export async function sendReceiptEmail(
  to: string,
  receipt: {
    id: number;
    planType: string;
    amount: number;
    currency: string;
    paymobOrderId: string | null;
    paymobTransactionId: string | null;
    paidAt: Date | null;
    createdAt: Date;
  },
  doctorName: string,
  pdfBuffer: Buffer,
): Promise<void> {
  const planLabels: Record<string, string> = {
    MONTHS_3: "3-Month Subscription",
    MONTHS_6: "6-Month Subscription",
    YEARLY: "1-Year Subscription",
  };
  const planLabel = planLabels[receipt.planType] ?? receipt.planType;
  const paymentDate = (receipt.paidAt ?? receipt.createdAt).toLocaleDateString("en-GB", {
    year: "numeric", month: "long", day: "numeric",
  });
  const amountFormatted = `${receipt.amount.toLocaleString("en-EG")} ${receipt.currency}`;

  const rows = [
    ["Doctor Name", doctorName],
    ["Plan", planLabel],
    ["Amount", amountFormatted],
    ["Payment Date", paymentDate],
    ["Order ID", receipt.paymobOrderId ?? "—"],
    ["Transaction ID", receipt.paymobTransactionId ?? "—"],
  ]
    .map(
      ([label, value]) =>
        `<tr>
          <td style="padding:8px 12px;background:#F8FAFC;border:1px solid #E2E8F0;font-weight:600;color:#374151;width:140px;font-size:13px">${label}</td>
          <td style="padding:8px 12px;border:1px solid #E2E8F0;color:#1E293B;font-size:13px">${value}</td>
        </tr>`,
    )
    .join("");

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;background:#fff">
      ${LOGO}
      <h2 style="color:#0F172A;font-size:20px;margin-bottom:4px">Payment Receipt #${receipt.id}</h2>
      <p style="color:#64748B;font-size:13px;margin-bottom:24px">Your subscription payment was successful.</p>
      <div style="background:#F0FDF4;border:1px solid #22C55E;border-radius:8px;padding:14px 18px;margin-bottom:24px">
        <p style="color:#166534;margin:0;font-size:14px">✅ Your <strong>${planLabel}</strong> subscription is now active.</p>
      </div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:28px">${rows}</table>
      <p style="color:#475569;font-size:13px;line-height:1.6">
        Your receipt is attached to this email as a PDF for your records. Thank you for subscribing to EGY Doctors!
      </p>
      ${FOOTER}
    </div>
  `;

  await sendEmail(
    to,
    `Payment Receipt #${receipt.id} — EGY Doctors`,
    html,
    [{ filename: `receipt-${receipt.id}.pdf`, content: pdfBuffer.toString("base64") }],
  );
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

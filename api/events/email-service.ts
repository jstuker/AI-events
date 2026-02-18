import nodemailer from "nodemailer";

// --- Types ---

export interface EmailConfig {
  readonly host: string;
  readonly port: number;
  readonly secure: boolean;
  readonly user: string;
  readonly password: string;
  readonly fromEmail: string;
  readonly fromName: string;
  readonly notificationEmail: string;
}

export interface SubmissionEmailData {
  readonly event_id: string;
  readonly event_name: string;
  readonly event_start_date: string;
  readonly event_start_time: string;
  readonly event_end_date: string;
  readonly event_end_time: string;
  readonly event_url: string;
  readonly contact_name: string;
  readonly contact_email: string;
  readonly location_name: string;
  readonly organizer_name: string;
}

// --- Config ---

export function getEmailConfig(): EmailConfig | null {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host || !user || !password) {
    return null;
  }

  return {
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    user,
    password,
    fromEmail: process.env.FROM_EMAIL || user,
    fromName: process.env.FROM_NAME || "Swiss {ai} Weeks",
    notificationEmail: process.env.NOTIFICATION_EMAIL || "",
  };
}

export function isEmailEnabled(): boolean {
  // Disable in preview/development environments unless explicitly enabled
  if (process.env.ENABLE_EMAILS === "true") return true;
  const vercelEnv = process.env.VERCEL_ENV;
  return vercelEnv === "production";
}

// --- Transport ---

function createTransport(config: EmailConfig) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.password,
    },
  });
}

// --- Email templates ---

export function buildConfirmationEmail(data: SubmissionEmailData): {
  readonly subject: string;
  readonly html: string;
  readonly text: string;
} {
  const subject = `Event submission received: ${data.event_name}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;background:#f5f5f5">
  <div style="max-width:600px;margin:0 auto;padding:24px">
    <div style="background:#fff;border-radius:8px;padding:32px;border:1px solid #e0e0e0">
      <h1 style="font-size:20px;margin:0 0 16px;color:#1a1a1a">Thank you for your submission!</h1>
      <p style="margin:0 0 16px;line-height:1.6">Dear ${escapeHtml(data.contact_name)},</p>
      <p style="margin:0 0 16px;line-height:1.6">We have received your event submission and it is now under review by the Swiss {ai} Weeks team.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;width:140px">Event</td><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600">${escapeHtml(data.event_name)}</td></tr>
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666">Start</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${escapeHtml(formatDateTime(data.event_start_date, data.event_start_time))}</td></tr>
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666">End</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${escapeHtml(formatDateTime(data.event_end_date, data.event_end_time))}</td></tr>
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666">Location</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${escapeHtml(data.location_name)}</td></tr>
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666">Submission ID</td><td style="padding:8px 12px;border-bottom:1px solid #eee;font-family:monospace;font-size:13px">${escapeHtml(data.event_id)}</td></tr>
      </table>
      <p style="margin:16px 0;line-height:1.6">We will notify you once your event has been reviewed and published. If you have questions, reply to this email.</p>
      <p style="margin:16px 0 0;line-height:1.6;color:#666;font-size:14px">— The Swiss {ai} Weeks Team<br><a href="https://ai-weeks.ch" style="color:#2563eb">ai-weeks.ch</a></p>
    </div>
  </div>
</body>
</html>`;

  const text = `Thank you for your submission!

Dear ${data.contact_name},

We have received your event submission and it is now under review by the Swiss {ai} Weeks team.

Event: ${data.event_name}
Start: ${formatDateTime(data.event_start_date, data.event_start_time)}
End: ${formatDateTime(data.event_end_date, data.event_end_time)}
Location: ${data.location_name}
Submission ID: ${data.event_id}

We will notify you once your event has been reviewed and published. If you have questions, reply to this email.

— The Swiss {ai} Weeks Team
https://ai-weeks.ch`;

  return { subject, html, text };
}

export function buildNotificationEmail(data: SubmissionEmailData): {
  readonly subject: string;
  readonly html: string;
  readonly text: string;
} {
  const subject = `New event submission: ${data.event_name}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;background:#f5f5f5">
  <div style="max-width:600px;margin:0 auto;padding:24px">
    <div style="background:#fff;border-radius:8px;padding:32px;border:1px solid #e0e0e0">
      <h1 style="font-size:20px;margin:0 0 16px;color:#1a1a1a">New Event Submission</h1>
      <p style="margin:0 0 16px;line-height:1.6">A new event has been submitted via the public form and needs review.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;width:140px">Event</td><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600">${escapeHtml(data.event_name)}</td></tr>
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666">Start</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${escapeHtml(formatDateTime(data.event_start_date, data.event_start_time))}</td></tr>
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666">End</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${escapeHtml(formatDateTime(data.event_end_date, data.event_end_time))}</td></tr>
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666">Location</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${escapeHtml(data.location_name)}</td></tr>
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666">Organizer</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${escapeHtml(data.organizer_name || "Not provided")}</td></tr>
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666">Contact</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${escapeHtml(data.contact_name)} &lt;${escapeHtml(data.contact_email)}&gt;</td></tr>
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666">Event URL</td><td style="padding:8px 12px;border-bottom:1px solid #eee"><a href="${escapeHtml(data.event_url)}" style="color:#2563eb">${escapeHtml(data.event_url)}</a></td></tr>
        <tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666">Submission ID</td><td style="padding:8px 12px;border-bottom:1px solid #eee;font-family:monospace;font-size:13px">${escapeHtml(data.event_id)}</td></tr>
      </table>
      <p style="margin:16px 0;line-height:1.6">Review this event in the <a href="https://ai-weeks.ch/admin/" style="color:#2563eb">admin panel</a>.</p>
    </div>
  </div>
</body>
</html>`;

  const text = `New Event Submission

A new event has been submitted via the public form and needs review.

Event: ${data.event_name}
Start: ${formatDateTime(data.event_start_date, data.event_start_time)}
End: ${formatDateTime(data.event_end_date, data.event_end_time)}
Location: ${data.location_name}
Organizer: ${data.organizer_name || "Not provided"}
Contact: ${data.contact_name} <${data.contact_email}>
Event URL: ${data.event_url}
Submission ID: ${data.event_id}

Review this event in the admin panel: https://ai-weeks.ch/admin/`;

  return { subject, html, text };
}

// --- Send functions ---

export async function sendConfirmationEmail(
  config: EmailConfig,
  data: SubmissionEmailData,
): Promise<void> {
  const transport = createTransport(config);
  const email = buildConfirmationEmail(data);

  await transport.sendMail({
    from: `"${config.fromName}" <${config.fromEmail}>`,
    to: data.contact_email,
    subject: email.subject,
    html: email.html,
    text: email.text,
  });
}

export async function sendNotificationEmail(
  config: EmailConfig,
  data: SubmissionEmailData,
): Promise<void> {
  const transport = createTransport(config);
  const email = buildNotificationEmail(data);

  await transport.sendMail({
    from: `"${config.fromName}" <${config.fromEmail}>`,
    to: config.notificationEmail,
    replyTo: data.contact_email,
    subject: email.subject,
    html: email.html,
    text: email.text,
  });
}

export async function sendSubmissionEmails(
  data: SubmissionEmailData,
): Promise<{ readonly sent: boolean; readonly error?: string }> {
  if (!isEmailEnabled()) {
    console.log(
      JSON.stringify({
        log_type: "email_skipped",
        reason: "emails_disabled",
        event_id: data.event_id,
      }),
    );
    return { sent: false, error: "Emails disabled in this environment" };
  }

  const config = getEmailConfig();
  if (!config) {
    console.log(
      JSON.stringify({
        log_type: "email_skipped",
        reason: "smtp_not_configured",
        event_id: data.event_id,
      }),
    );
    return { sent: false, error: "SMTP not configured" };
  }

  const emailTasks: Promise<void>[] = [sendConfirmationEmail(config, data)];
  if (config.notificationEmail) {
    emailTasks.push(sendNotificationEmail(config, data));
  }

  const results = await Promise.allSettled(emailTasks);

  const errors: string[] = [];
  for (const result of results) {
    if (result.status === "rejected") {
      const msg =
        result.reason instanceof Error
          ? result.reason.message
          : String(result.reason);
      errors.push(msg);
    }
  }

  if (errors.length > 0) {
    console.error(
      JSON.stringify({
        log_type: "email_error",
        event_id: data.event_id,
        errors,
      }),
    );
    return { sent: true, error: errors.join("; ") };
  }

  console.log(
    JSON.stringify({
      log_type: "email_sent",
      event_id: data.event_id,
      confirmation_to: data.contact_email,
      notification_to: config.notificationEmail,
    }),
  );

  return { sent: true };
}

// --- Helpers ---

function formatDateTime(date: string, time: string): string {
  return time ? `${date} ${time}` : date;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

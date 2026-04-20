import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  subject: z.enum(['General Inquiry', 'Partnership', 'Technical Support', 'Feature Request', 'Other']),
  message: z.string().min(10, 'Message must be at least 10 characters').max(5000),
});

/** Always extract a plain string — never return an object as the error field. */
function safeStr(val: unknown, fallback: string): string {
  if (typeof val === 'string' && val) return val;
  if (val && typeof (val as any).message === 'string') return (val as any).message;
  return fallback;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = contactSchema.parse(body);

    // Guard: require API key before attempting to send
    if (!process.env.RESEND_API_KEY) {
      console.error('[Contact] RESEND_API_KEY is not set');
      return NextResponse.json(
        { success: false, error: 'Email service is not configured. Please reach out directly at hello@velonx.com' },
        { status: 503 }
      );
    }

    const teamHtml = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8" /></head>
        <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f6f9fc;margin:0;padding:0;">
          <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;margin-top:32px;">
            <div style="background:linear-gradient(135deg,#219EBC 0%,#023047 100%);padding:32px;text-align:center;">
              <h1 style="color:#fff;font-size:28px;font-weight:900;margin:0;letter-spacing:2px;">VELONX</h1>
              <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:8px 0 0;">New Contact Form Submission</p>
            </div>
            <div style="padding:32px;">
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;width:120px;">From</td>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-size:15px;color:#111827;font-weight:700;">${name}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;">Email</td>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-size:15px;color:#219EBC;">${email}</td>
                </tr>
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;">Subject</td>
                  <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;font-size:15px;color:#111827;">${subject}</td>
                </tr>
              </table>
              <div style="margin-top:24px;">
                <p style="font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;margin:0 0 12px;">Message</p>
                <div style="background:#f9fafb;border-radius:12px;padding:20px;font-size:15px;color:#374151;line-height:1.7;white-space:pre-wrap;">${message}</div>
              </div>
              <div style="margin-top:24px;padding:16px;background:#fef3c7;border-radius:12px;font-size:13px;color:#92400e;">
                Reply to: <a href="mailto:${email}" style="color:#219EBC;font-weight:700;">${email}</a>
              </div>
            </div>
            <div style="padding:20px;border-top:1px solid #e5e7eb;text-align:center;font-size:12px;color:#9ca3af;">
              &copy; ${new Date().getFullYear()} VELONX. All rights reserved.
            </div>
          </div>
        </body>
      </html>
    `;

    const replyHtml = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8" /></head>
        <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f6f9fc;margin:0;padding:0;">
          <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;margin-top:32px;">
            <div style="background:linear-gradient(135deg,#219EBC 0%,#023047 100%);padding:32px;text-align:center;">
              <h1 style="color:#fff;font-size:28px;font-weight:900;margin:0;letter-spacing:2px;">VELONX</h1>
              <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:8px 0 0;">We received your message!</p>
            </div>
            <div style="padding:36px 32px;">
              <h2 style="font-size:22px;font-weight:800;color:#023047;margin:0 0 16px;">Hey ${name} 👋</h2>
              <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 16px;">
                Thanks for reaching out. We have received your message about <strong>${subject}</strong> and our team will get back to you within <strong>1-2 business days</strong>.
              </p>
              <div style="background:#f0f9ff;border-left:4px solid #219EBC;border-radius:0 12px 12px 0;padding:16px 20px;margin:24px 0;">
                <p style="font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;margin:0 0 8px;">Your message</p>
                <p style="font-size:14px;color:#374151;line-height:1.6;margin:0;white-space:pre-wrap;">${message.slice(0, 300)}${message.length > 300 ? '...' : ''}</p>
              </div>
            </div>
            <div style="padding:20px 32px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="font-size:12px;color:#9ca3af;margin:0;">&copy; ${new Date().getFullYear()} VELONX</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const emailFrom = process.env.EMAIL_FROM || 'VELONX <onboarding@resend.dev>';
    const teamEmail = process.env.EMAIL_REPLY_TO || 'support@velonx.com';

    const [teamResult, replyResult] = await Promise.allSettled([
      resend.emails.send({
        from: emailFrom,
        to: teamEmail,
        replyTo: email,
        subject: `[Contact] ${subject} — from ${name}`,
        html: teamHtml,
      }),
      resend.emails.send({
        from: emailFrom,
        to: email,
        subject: `We received your message, ${name}!`,
        html: replyHtml,
      }),
    ]);

    if (teamResult.status === 'rejected' || teamResult.value?.error) {
      const raw = teamResult.status === 'rejected'
        ? teamResult.reason
        : teamResult.value.error;
      console.error('[Contact] Team email failed:', raw);
      return NextResponse.json(
        { success: false, error: 'Failed to send your message. Please try again later.' },
        { status: 500 }
      );
    }

    if (replyResult.status === 'rejected') {
      console.warn('[Contact] Auto-reply failed (non-critical):', replyResult.reason);
    }

    return NextResponse.json({ success: true, message: 'Message sent successfully!' });

  } catch (error) {
    if (error instanceof z.ZodError) {
      const msg = safeStr(error.issues?.[0]?.message, 'Invalid form data');
      return NextResponse.json({ success: false, error: msg }, { status: 400 });
    }
    console.error('[Contact] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

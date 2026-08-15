import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { contactReplyEmail, contactTeamEmail } from '@/emails/contact-form';

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
        { success: false, error: 'Email service is not configured. Please reach out directly at info@velonx.in' },
        { status: 503 }
      );
    }

    const submission = { name, email, subject, message };
    const teamHtml = contactTeamEmail(submission);
    const replyHtml = contactReplyEmail(submission);

    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const emailFrom = process.env.EMAIL_FROM || 'VELONX <noreply@velonx.in>';
    const teamEmail = process.env.EMAIL_REPLY_TO || 'support@velonx.in';

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
        subject: `We got your message, ${name}`,
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

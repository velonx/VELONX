/**
 * Contact-form emails.
 *
 * Plain HTML rather than React Email so the contact route stays dependency-free,
 * but the tokens and layout mirror `src/emails/base-layout.tsx`.
 */

const T = {
    paper: '#F5F5EE',
    surface: '#FFFFFF',
    surfaceMuted: '#FAFAF5',
    ink: '#16140F',
    warmGray: '#5E5B56',
    muted: '#8A8780',
    accent: '#F0771A',
    accentInk: '#B4530C',
    accentSoft: '#FDF1E6',
    accentBorder: '#F7D9BC',
    border: '#E6E4DC',
};

const SANS =
    "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";
const SERIF = "'Source Serif 4',Georgia,'Times New Roman',serif";

/** Escape user-supplied text before it goes into the email HTML. */
export function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function shell(eyebrow: string, inner: string): string {
    return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="color-scheme" content="light" />
  </head>
  <body style="font-family:${SANS};background:${T.paper};margin:0;padding:32px 12px;">
    <div style="max-width:600px;margin:0 auto;background:${T.surface};border:1px solid ${T.border};border-radius:18px;overflow:hidden;">
      <div style="height:3px;background:${T.accent};line-height:3px;font-size:0;">&nbsp;</div>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:24px 40px;border-bottom:1px solid ${T.border};">
            <span style="font-size:26px;font-weight:800;letter-spacing:-1px;color:${T.ink};">velon<span style="color:${T.accent};">x</span></span>
          </td>
          <td style="padding:24px 40px;border-bottom:1px solid ${T.border};text-align:right;font-size:11px;font-weight:600;letter-spacing:0.6px;text-transform:uppercase;color:${T.muted};">${eyebrow}</td>
        </tr>
      </table>
      <div style="padding:36px 40px;">${inner}</div>
      <div style="padding:22px 40px 28px;border-top:1px solid ${T.border};text-align:center;">
        <p style="font-size:11px;color:${T.muted};margin:0;">&copy; ${new Date().getFullYear()} VELONX &middot; Built with students, for students</p>
      </div>
    </div>
  </body>
</html>`;
}

export interface ContactSubmission {
    name: string;
    email: string;
    subject: string;
    message: string;
}

/** Internal notification sent to the VELONX inbox. */
export function contactTeamEmail({ name, email, subject, message }: ContactSubmission): string {
    const labelCell = `padding:12px 0;border-bottom:1px solid ${T.border};font-size:11px;color:${T.muted};font-weight:700;letter-spacing:1px;text-transform:uppercase;width:110px;vertical-align:top;`;
    const valueCell = `padding:12px 0;border-bottom:1px solid ${T.border};font-size:15px;color:${T.ink};`;

    return shell(
        'Contact form',
        `
      <p style="font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:${T.accent};margin:0 0 12px;">New enquiry</p>
      <h1 style="font-family:${SERIF};font-size:27px;font-weight:400;color:${T.ink};margin:0 0 20px;line-height:36px;">${escapeHtml(subject)} &mdash; from ${escapeHtml(name)}</h1>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="${labelCell}">From</td>
          <td style="${valueCell}font-weight:700;">${escapeHtml(name)}</td>
        </tr>
        <tr>
          <td style="${labelCell}">Email</td>
          <td style="${valueCell}"><a href="mailto:${encodeURI(email)}" style="color:${T.accent};text-decoration:underline;">${escapeHtml(email)}</a></td>
        </tr>
        <tr>
          <td style="${labelCell}">Topic</td>
          <td style="${valueCell}">${escapeHtml(subject)}</td>
        </tr>
      </table>
      <p style="font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:${T.muted};margin:26px 0 10px;">Message</p>
      <div style="background:${T.surfaceMuted};border:1px solid ${T.border};border-radius:14px;padding:20px 22px;font-size:15px;color:${T.warmGray};line-height:1.7;white-space:pre-wrap;">${escapeHtml(message)}</div>
      <div style="margin-top:22px;padding:14px 18px;background:${T.accentSoft};border:1px solid ${T.accentBorder};border-radius:12px;font-size:14px;color:${T.accentInk};">
        Hit reply to answer ${escapeHtml(name)} directly &mdash; replies go straight to ${escapeHtml(email)}.
      </div>
    `
    );
}

/** Auto-reply sent to the person who filled in the form. */
export function contactReplyEmail({ name, subject, message }: ContactSubmission): string {
    const excerpt = escapeHtml(message.slice(0, 300)) + (message.length > 300 ? '&hellip;' : '');

    return shell(
        'Message received',
        `
      <p style="font-size:11px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:${T.accent};margin:0 0 12px;">We got it</p>
      <h1 style="font-family:${SERIF};font-size:29px;font-weight:400;color:${T.ink};margin:0 0 18px;line-height:38px;">Thanks for writing in, ${escapeHtml(name)}</h1>
      <p style="font-size:16px;color:${T.warmGray};line-height:26px;margin:0 0 16px;">
        Your message about <strong style="color:${T.ink};">${escapeHtml(subject)}</strong> reached the VELONX team. A real person reads every one of these, and you&rsquo;ll hear back within <strong style="color:${T.ink};">1&ndash;2 business days</strong>.
      </p>
      <div style="background:${T.accentSoft};border-left:3px solid ${T.accent};border-radius:4px 12px 12px 4px;padding:16px 20px;margin:22px 0;">
        <p style="font-size:11px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:${T.muted};margin:0 0 8px;">What you sent</p>
        <p style="font-size:15px;color:${T.warmGray};line-height:24px;margin:0;white-space:pre-wrap;">${excerpt}</p>
      </div>
      <p style="font-size:16px;color:${T.warmGray};line-height:26px;margin:0 0 16px;">
        Something urgent in the meantime? Reply to this email &mdash; it lands in the same inbox.
      </p>
      <p style="font-size:15px;color:${T.warmGray};line-height:24px;margin:24px 0 0;">&mdash; The VELONX team</p>
    `
    );
}

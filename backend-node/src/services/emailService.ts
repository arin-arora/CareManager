import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
let resend: Resend | null = null;

if (resendApiKey) {
  resend = new Resend(resendApiKey);
  console.log('✓ Resend Email Service initialized.');
} else {
  console.warn('⚠ RESEND_API_KEY is not defined. Email service running in fallback/development mode.');
}

export const fromEmail = (process.env.SMTP_FROM && process.env.SMTP_FROM !== 'no-reply@caremanager.health')
  ? process.env.SMTP_FROM
  : 'onboarding@resend.dev';

export const fromAddress = `CareManager <${fromEmail}>`;

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export const sendEmail = async ({ to, subject, html, text }: SendEmailOptions) => {
  if (resend) {
    try {
      const response = await resend.emails.send({
        from: fromAddress,
        to: [to],
        subject,
        html,
        text
      });

      if (response.error) {
        console.error('Resend API Error details:', response.error);
        throw new Error(response.error.message || 'Resend failed to send email');
      }

      console.log(`✓ Email sent successfully to ${to} via Resend. ID: ${response.data?.id}`);
      return response.data;
    } catch (err: any) {
      console.error(`Resend failed to send email to ${to}:`, err.message);
      throw new Error(`Email delivery failed: ${err.message}`);
    }
  } else {
    // Development mode fallback: log to console
    console.log('\n=================== [DEVELOPMENT MODE: EMAIL LOG] ===================');
    console.log(`From: ${fromAddress}`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body (Plain text):\n${text}`);
    console.log('======================================================================\n');
    return { id: 'dev-mode-mock-id' };
  }
};

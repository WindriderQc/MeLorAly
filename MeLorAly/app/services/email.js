const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASSWORD,
      SMTP_SECURE,
      SUPPORT_INBOX
    } = process.env;

    this.supportInbox = SUPPORT_INBOX;
    this.isConfigured = Boolean(SMTP_HOST && SUPPORT_INBOX);

    if (this.isConfigured) {
      this.transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT ? Number(SMTP_PORT) : 587,
        secure: SMTP_SECURE ? SMTP_SECURE === 'true' : false,
        auth: SMTP_USER && SMTP_PASSWORD ? {
          user: SMTP_USER,
          pass: SMTP_PASSWORD
        } : undefined
      });
    }
  }

  async sendSupportEmail({ name, email, subject, message }) {
    if (!this.isConfigured) {
      console.warn('[EmailService] SMTP is not configured. Falling back to console logging.');
      this.logFallback({ name, email, subject, message });
      return { sent: false, reason: 'not_configured' };
    }

    try {
      await this.transporter.sendMail({
        to: this.supportInbox,
        from: this.supportInbox,
        replyTo: email,
        subject: `[Contact] ${subject}`,
        text: this.buildPlainText({ name, email, message }),
        html: this.buildHtml({ name, email, message })
      });

      return { sent: true };
    } catch (error) {
      console.error('[EmailService] Failed to send support email:', error);
      this.logFallback({ name, email, subject, message });
      return { sent: false, reason: 'send_error', error };
    }
  }

  buildPlainText({ name, email, message }) {
    return [
      `Nouvelle demande de contact MeLorAly`,
      `Nom: ${name}`,
      `Email: ${email}`,
      '',
      'Message:',
      message
    ].join('\n');
  }

  buildHtml({ name, email, message }) {
    return `
      <h2>Nouvelle demande de contact MeLorAly</h2>
      <p><strong>Nom :</strong> ${name}</p>
      <p><strong>Email :</strong> ${email}</p>
      <hr />
      <p>${message.replace(/\n/g, '<br />')}</p>
    `;
  }

  logFallback({ name, email, subject, message }) {
    console.info('[EmailService] Contact request (logged fallback):', {
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = new EmailService();

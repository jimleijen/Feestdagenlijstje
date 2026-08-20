import nodemailer from "nodemailer";

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;

const transport = SMTP_HOST
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT ?? 587),
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    })
  : null;

export async function sendMail(to: string, subject: string, text: string): Promise<void> {
  if (!transport) {
    // No SMTP configured (typical in local dev) — log instead of failing silently.
    console.log(`[mailer] (geen SMTP geconfigureerd, log-only)\nAan: ${to}\nOnderwerp: ${subject}\n${text}\n`);
    return;
  }
  await transport.sendMail({
    from: MAIL_FROM ?? "Feestdagenlijstje <no-reply@feestdagenlijstje.app>",
    to,
    subject,
    text,
  });
}

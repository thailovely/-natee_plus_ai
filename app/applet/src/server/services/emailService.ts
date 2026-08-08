import nodemailer from 'nodemailer';

export async function sendSystemEmail({
  to,
  subject,
  title,
  otpCode,
  bodyText
}: {
  to: string;
  subject: string;
  title: string;
  otpCode?: string;
  bodyText?: string;
}) {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
  const smtpUser = process.env.SMTP_USER || process.env.SMTP_EMAIL || 'nateeplusmarket@gmail.com';
  const smtpPass = process.env.SMTP_PASS || process.env.SMTP_APP_PASSWORD || 'tssfmgvjdocyvgwx';
  const smtpFrom = process.env.SMTP_FROM || "Natee Plus <" + smtpUser + ">";

  if (!smtpUser || !smtpPass) {
    console.log("✉️ [SMTP Email] Credentials not configured in process.env (missing SMTP_USER/SMTP_PASS). Simulated email to: " + to + " | Subject: " + subject + " | OTP: " + (otpCode || 'N/A'));
    return { success: false, simulated: true, message: "SMTP credentials not configured" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const htmlContent = `
      <div style="font-family: 'Sukhumvit Set', 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
            <span style="color: #38bdf8;">นที</span> <span style="color: #f97316;">พลัส</span>
          </h1>
          <p style="color: #cbd5e1; margin: 6px 0 0 0; font-size: 13px;">ระบบร้านค้าออนไลน์และเครือข่ายความสุข</p>
        </div>
        <div style="padding: 32px 24px; text-align: center; color: #1e293b;">
          <h2 style="font-size: 18px; margin-top: 0; margin-bottom: 12px; color: #0f172a;">` + title + `</h2>
          <p style="font-size: 14px; color: #475569; margin-bottom: 24px; line-height: 1.6;">
            ` + (bodyText || 'รหัสยืนยันตัวตน OTP ของท่านสำหรับทำรายการในระบบ Natee Plus คือ:') + `
          </p>
          ` + (otpCode ? `
            <div style="background-color: #f8fafc; border: 2px dashed #0284c7; border-radius: 12px; padding: 16px; margin: 0 auto 24px auto; max-width: 280px;">
              <span style="font-family: monospace, Courier, monospace; font-size: 32px; font-weight: 900; letter-spacing: 6px; color: #0369a1;">` + otpCode + `</span>
            </div>
            <p style="font-size: 12px; color: #64748b; margin-bottom: 0;">รหัส OTP นี้มีอายุการใช้งาน 5 นาที และเป็นรหัสส่วนตัว โปรดอย่าเปิดเผยให้ผู้อื่นทราบ</p>
          ` : '') + `
        </div>
        <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0;">© ` + new Date().getFullYear() + ` Natee Plus Co., Ltd. All rights reserved.</p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: smtpFrom,
      to,
      subject,
      html: htmlContent,
      text: title + "\\n\\n" + (bodyText || 'รหัส OTP ของคุณคือ:') + " " + (otpCode || ''),
    });

    console.log("✅ [SMTP Email Success] Email sent to " + to + ". MessageId: " + info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error("❌ [SMTP Email Error] Failed to send email to " + to + ":", err);
    return { success: false, error: err.message };
  }
}

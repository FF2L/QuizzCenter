import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
     constructor(private readonly mailer: MailerService) {}

  async sendOtp(to: string, code: string, ttlMinutes = 5) {

    const html = `
      <h2>Mã OTP của bạn</h2>
      <p>Mã: <strong style="font-size:24px;letter-spacing:2px">${code}</strong></p>
      <p>Hiệu lực trong ${ttlMinutes} phút. Không chia sẻ OTP cho bất kỳ ai.</p>
    `;

    await this.mailer.sendMail({
      to,
      subject: `Mã OTP của bạn: ${code}`,
      html, // <-- dùng trực tiếp HTML inline
    });

    return { ok: true };
  }
}

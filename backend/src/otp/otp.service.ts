// src/otp/otp.service.ts
import { Inject, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import type Redis from 'ioredis';
import { MailService } from '../mail/mail.service';
import * as crypto from 'crypto';

const OTP_TTL_SEC = 300; // 5 phút
const MAX_ATTEMPTS = 5;
const RESET_TTL_SEC = 15 * 60; // 15 phút

@Injectable()
export class OtpService {
  constructor(
    @Inject('REDIS') private readonly redis: Redis,
    private readonly mail: MailService,
  ) {}

  private otpKey(email: string) {
    return `otp:${email}`;
  }

  private attemptKey(email: string) {
    return `otp:attempts:${email}`;
  }

  private hash(code: string) {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  private genCode(): string {
    return (Math.floor(100000 + Math.random() * 900000)).toString(); // 6 số
  }

  /** Tạo/ghi đè OTP 5 phút, reset attempts, gửi mail */
  private async issueOtp(email: string) {
    const code = this.genCode();
    const hashed = this.hash(code);
    const key = this.otpKey(email);
    const attemptsKey = this.attemptKey(email);

    await this.redis.multi()
      .set(key, hashed, 'EX', OTP_TTL_SEC) // luôn đặt lại TTL = 5p
      .del(attemptsKey)                    // reset attempt
      .exec();

    // gửi email (hiển thị TTL = 5 phút)
    await this.mail.sendOtp(email, code, 5);

    return { ok: true, ttlSec: OTP_TTL_SEC };
  }

  /** Gửi OTP lần đầu (nếu đã có thì vẫn ghi đè theo yêu cầu) */
  async send(email: string) {
    return this.issueOtp(email);
  }

  /** Resend OTP: luôn sinh mã mới, reset TTL 5p, không cooldown */
  async resend(email: string) {
    // Nếu cần ràng buộc thêm (vd yêu cầu đã từng send trước đó) thì check key ở đây:
    // const existed = await this.redis.exists(this.otpKey(email));
    // if (!existed) throw new BadRequestException('Chưa tạo OTP cho email này');
    return this.issueOtp(email);
  }

  /** Xác thực OTP (giới hạn MAX_ATTEMPTS lần trong TTL) */
  async verify(email: string, code: string) {
  const key = this.otpKey(email);
  const hashedStored = await this.redis.get(key);
  if (!hashedStored) throw new UnauthorizedException('OTP hết hạn hoặc không tồn tại');

  const attemptsKey = this.attemptKey(email);
  const attempts = Number(await this.redis.get(attemptsKey)) || 0;
  if (attempts >= 5) {
    await this.redis.del(key);
    throw new UnauthorizedException('Quá số lần thử. Vui lòng gửi lại OTP.');
  }

  const match = this.hash(code) === hashedStored;
  if (!match) {
    await this.redis.multi().incr(attemptsKey).expire(attemptsKey, 300).exec();
    throw new UnauthorizedException('OTP không đúng');
  }

  // OTP đúng → xóa OTP (single-use)
  await this.redis.del(key);
  await this.redis.del(attemptsKey);

  // Cấp reset-token dùng-một-lần, TTL 15'
  const resetToken = crypto.randomBytes(32).toString('hex');
  await this.redis.set(`pwdreset:${resetToken}`, email, 'EX', RESET_TTL_SEC);

  return { ok: true, resetToken, ttlSec: RESET_TTL_SEC };
}
}

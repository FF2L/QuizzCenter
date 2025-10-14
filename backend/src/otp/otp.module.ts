// src/otp/otp.module.ts
import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { MailService } from '../mail/mail.service'; // dùng MailerService wrapper

@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60,        // 60s
      limit: 5,       // tối đa 5 request/phút mỗi IP
    }]),
  ],
  controllers: [OtpController],
  providers: [OtpService, MailService],
  exports: [OtpService],
})
export class OtpModule {}

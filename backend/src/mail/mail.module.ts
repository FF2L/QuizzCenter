// src/mail/mail.module.ts
import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const host = cfg.get<string>('SMTP_HOST') ?? 'smtp.gmail.com';
        const port = Number(cfg.get('SMTP_PORT') ?? 465);
        const secure = String(cfg.get('SMTP_SECURE') ?? 'true') !== 'false';
        const user = cfg.get<string>('EMAIL_USER');
        const pass = cfg.get<string>('EMAIL_PASS');
        const from = cfg.get<string>('SMTP_FROM') || `"QuizzCenter" <${user}>`;

        // Log chẩn đoán (ẩn pass)

        if (!user || !pass) throw new Error('[Mailer] Thiếu EMAIL_USER/EMAIL_PASS trong env');

        return {
          transport: { host, port, secure, auth: { user, pass } },
          defaults: { from },
          template: {
            dir: join(__dirname, '..', 'templates'),
            adapter: new HandlebarsAdapter(),
            options: { strict: true },
          },
          options: { logger: true },
        };
      },
    }),
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailerModule, MailService],
})
export class MailModule {}

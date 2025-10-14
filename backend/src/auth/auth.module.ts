import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { NguoiDungService } from 'src/nguoi-dung/nguoi-dung.service';
import { LocalStrategy } from './strategies/local.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NguoiDung } from 'src/nguoi-dung/entities/nguoi-dung.entity';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from 'src/config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import refeshJwtConfig from 'src/config/refeshJwt.config';
import { RefeshJwtStrategy } from './strategies/refesh-jwt.stategy';
import { PassportModule } from '@nestjs/passport';
import { MailModule } from 'src/mail/mail.module';
import { NguoiDungModule } from 'src/nguoi-dung/nguoi-dung.module';
import { OtpModule } from 'src/otp/otp.module';


@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([NguoiDung]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig), //đăng ký jwt như repository để có thể sử dụng jwt config
    ConfigModule.forFeature(refeshJwtConfig),
    MailModule,
    OtpModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, NguoiDungService, LocalStrategy, JwtStrategy, RefeshJwtStrategy],

})
export class AuthModule {}

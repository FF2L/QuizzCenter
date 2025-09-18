import { ConfigModule } from '@nestjs/config';
import { Module, ValidationPipe } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NguoiDungModule } from './nguoi-dung/nguoi-dung.module';
import { ThongBaoModule } from './thong-bao/thong-bao.module';
import { KhoaModule } from './khoa/khoa.module';
import { MonHocModule } from './mon-hoc/mon-hoc.module';
import { GiangVienModule } from './giang-vien/giang-vien.module';
import { SinhVienModule } from './sinh-vien/sinh-vien.module';
import { ChuongModule } from './chuong/chuong.module';
import { CauHoiModule } from './cau-hoi/cau-hoi.module';
import { DapAnModule } from './dap-an/dap-an.module';
import { FileDinhKemModule } from './file-dinh-kem/file-dinh-kem.module';
import { LopHocPhanModule } from './lop-hoc-phan/lop-hoc-phan.module';
import { BaiKiemTraModule } from './bai-kiem-tra/bai-kiem-tra.module';
import { BaiLamSinhVienModule } from './bai-lam-sinh-vien/bai-lam-sinh-vien.module';
import dbPostgresConfig from './config/dbPostgres.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_PIPE } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { GuiFileModule } from './gui-file/gui-file.module';


@Module({
  imports: [
    ConfigModule.forRoot({
    isGlobal: true, // Để biến môi trường có thể sử dụng toàn cục trong ứng dụng
  expandVariables: true, // Để có thể sử dụng biến môi trường trong biến moi trường khác trong file .env 
  load: [dbPostgresConfig] // Để có thể sử dụng biến môi trường trong file dbPostgres.config.ts
  }),
   TypeOrmModule.forRootAsync({
      useFactory: dbPostgresConfig, // sử dụng khi dbPostgressCOnfig file trả về một hàm trả về instance của PostgresConnectionOptions
     })
    ,
    NguoiDungModule, ThongBaoModule, KhoaModule, MonHocModule, GiangVienModule, SinhVienModule, ChuongModule, CauHoiModule, DapAnModule, FileDinhKemModule, LopHocPhanModule, BaiKiemTraModule, BaiLamSinhVienModule, AuthModule, GuiFileModule],
  controllers: [AppController],
  providers: [AppService,
    {
            provide: APP_PIPE, // cung cấp ValidationPipe toàn cục cho user
      useValue: new ValidationPipe({
        whitelist: true, //loại bỏ các trường không có trong DTO
        forbidNonWhitelisted: true, //  trả về lỗi nếu có trường không có trong DTO
        transform: true, // tự động chuyển đổi kiểu dữ liệu
        transformOptions:{
          enableImplicitConversion: true // chuyển đổi ngầm định kiểu dữ liệu, ví dụ: string sang number
        }
      })
    }
  ],
})
export class AppModule {}

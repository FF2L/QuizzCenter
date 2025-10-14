import { forwardRef, Module } from '@nestjs/common';
import { BaiKiemTraService } from './bai-kiem-tra.service';
import { BaiKiemTraController } from './bai-kiem-tra.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaiKiemTra } from './entities/bai-kiem-tra.entity';
import { LopHocPhanModule } from 'src/lop-hoc-phan/lop-hoc-phan.module';
import { ChiTietCauHoiBaiKiemTra } from './entities/chi-tiet-cau-hoi-bai-kiem-tra';
import { CauHoiModule } from 'src/cau-hoi/cau-hoi.module';
import { BaiLamSinhVienModule } from 'src/bai-lam-sinh-vien/bai-lam-sinh-vien.module';

@Module({
  imports:[TypeOrmModule.forFeature([BaiKiemTra,ChiTietCauHoiBaiKiemTra]),LopHocPhanModule,CauHoiModule,  forwardRef(() => BaiLamSinhVienModule)],
  controllers: [BaiKiemTraController],
  providers: [BaiKiemTraService],
  exports: [BaiKiemTraService]
})
export class BaiKiemTraModule {}
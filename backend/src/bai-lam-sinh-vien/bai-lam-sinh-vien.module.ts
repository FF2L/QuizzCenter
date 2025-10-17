import { forwardRef, Module } from '@nestjs/common';
import { BaiLamSinhVienService } from './bai-lam-sinh-vien.service';
import { BaiLamSinhVienController } from './bai-lam-sinh-vien.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaiLamSinhVien } from './entities/bai-lam-sinh-vien.entity';
import { ChiTietBaiLam } from './entities/chi-tiet-bai-lam.entity';
import { LopHocPhanModule } from 'src/lop-hoc-phan/lop-hoc-phan.module';
import { BaiKiemTraModule } from 'src/bai-kiem-tra/bai-kiem-tra.module';
import { SinhVienModule } from 'src/sinh-vien/sinh-vien.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BaiLamSinhVien, ChiTietBaiLam]),
    forwardRef(() => LopHocPhanModule),
    forwardRef(() => BaiKiemTraModule),
    SinhVienModule
  ],
  controllers: [BaiLamSinhVienController],
  providers: [BaiLamSinhVienService],
  exports: [BaiLamSinhVienService],
})
export class BaiLamSinhVienModule {}
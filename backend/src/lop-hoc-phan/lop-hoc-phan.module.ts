import { Module } from '@nestjs/common';
import { LopHocPhanService } from './lop-hoc-phan.service';
import { LopHocPhanController } from './lop-hoc-phan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonHocModule } from 'src/mon-hoc/mon-hoc.module';
import { LopHocPhan } from './entities/lop-hoc-phan.entity';
import { GiangVienModule } from 'src/giang-vien/giang-vien.module';
import { BaiKiemTra } from 'src/bai-kiem-tra/entities/bai-kiem-tra.entity';
import { BaiLamSinhVien } from 'src/bai-lam-sinh-vien/entities/bai-lam-sinh-vien.entity';
import { SinhVien } from 'src/sinh-vien/entities/sinh-vien.entity';
import { NguoiDung } from 'src/nguoi-dung/entities/nguoi-dung.entity';


@Module({
  imports: [TypeOrmModule.forFeature([LopHocPhan, BaiKiemTra,BaiLamSinhVien, SinhVien,NguoiDung]), MonHocModule, GiangVienModule],
  controllers: [LopHocPhanController],
  providers: [LopHocPhanService],
  exports: [LopHocPhanService]
})
export class LopHocPhanModule {}

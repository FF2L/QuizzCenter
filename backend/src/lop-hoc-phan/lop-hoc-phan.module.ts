import { Module } from '@nestjs/common';
import { LopHocPhanService } from './lop-hoc-phan.service';
import { LopHocPhanController } from './lop-hoc-phan.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonHocModule } from 'src/mon-hoc/mon-hoc.module';
import { LopHocPhan } from './entities/lop-hoc-phan.entity';
import { GiangVienModule } from 'src/giang-vien/giang-vien.module';


@Module({
  imports: [TypeOrmModule.forFeature([LopHocPhan]), MonHocModule, GiangVienModule],
  controllers: [LopHocPhanController],
  providers: [LopHocPhanService],
  exports: [LopHocPhanService]
})
export class LopHocPhanModule {}

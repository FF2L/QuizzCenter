import { Module } from '@nestjs/common';
import { BaiKiemTraService } from './bai-kiem-tra.service';
import { BaiKiemTraController } from './bai-kiem-tra.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaiKiemTra } from './entities/bai-kiem-tra.entity';
import { LopHocPhanModule } from 'src/lop-hoc-phan/lop-hoc-phan.module';

@Module({
  imports:[TypeOrmModule.forFeature([BaiKiemTra]),LopHocPhanModule],
  controllers: [BaiKiemTraController],
  providers: [BaiKiemTraService],
  exports: [BaiKiemTraService]
})
export class BaiKiemTraModule {}

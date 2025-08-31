import { Module } from '@nestjs/common';
import { LopHocPhanService } from './lop-hoc-phan.service';
import { LopHocPhanController } from './lop-hoc-phan.controller';

@Module({
  controllers: [LopHocPhanController],
  providers: [LopHocPhanService],
})
export class LopHocPhanModule {}

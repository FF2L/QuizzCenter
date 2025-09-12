import { Module } from '@nestjs/common';
import { BaiKiemTraService } from './bai-kiem-tra.service';
import { BaiKiemTraController } from './bai-kiem-tra.controller';

@Module({
  controllers: [BaiKiemTraController],
  providers: [BaiKiemTraService],
})
export class BaiKiemTraModule {}

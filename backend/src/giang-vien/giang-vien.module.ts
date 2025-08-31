import { Module } from '@nestjs/common';
import { GiangVienService } from './giang-vien.service';
import { GiangVienController } from './giang-vien.controller';

@Module({
  controllers: [GiangVienController],
  providers: [GiangVienService],
})
export class GiangVienModule {}

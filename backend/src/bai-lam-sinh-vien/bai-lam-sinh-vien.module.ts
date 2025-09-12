import { Module } from '@nestjs/common';
import { BaiLamSinhVienService } from './bai-lam-sinh-vien.service';
import { BaiLamSinhVienController } from './bai-lam-sinh-vien.controller';

@Module({
  controllers: [BaiLamSinhVienController],
  providers: [BaiLamSinhVienService],
})
export class BaiLamSinhVienModule {}

import { Module } from '@nestjs/common';
import { SinhVienService } from './sinh-vien.service';
import { SinhVienController } from './sinh-vien.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SinhVien } from './entities/sinh-vien.entity';
import { NguoiDungModule } from 'src/nguoi-dung/nguoi-dung.module';

@Module({
  imports:[TypeOrmModule.forFeature([SinhVien]), NguoiDungModule],
  controllers: [SinhVienController],
  providers: [SinhVienService],
  exports: [SinhVienService]

})
export class SinhVienModule {}

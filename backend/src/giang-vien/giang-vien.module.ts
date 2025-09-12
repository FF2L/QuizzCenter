import { Module } from '@nestjs/common';
import { GiangVienService } from './giang-vien.service';
import { GiangVienController } from './giang-vien.controller';
import { NguoiDungService } from 'src/nguoi-dung/nguoi-dung.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GiangVien } from './entities/giang-vien.entity';
import { NguoiDungModule } from 'src/nguoi-dung/nguoi-dung.module';
import { NguoiDung } from 'src/nguoi-dung/entities/nguoi-dung.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GiangVien]),
  NguoiDungModule
],
  controllers: [GiangVienController],
  providers: [GiangVienService],
  exports: [GiangVienService]
})
export class GiangVienModule {}

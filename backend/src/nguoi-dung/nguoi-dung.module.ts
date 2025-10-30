import { Module } from '@nestjs/common';
import { NguoiDungService } from './nguoi-dung.service';
import { NguoiDungController } from './nguoi-dung.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NguoiDung } from './entities/nguoi-dung.entity';
import { SinhVien } from 'src/sinh-vien/entities/sinh-vien.entity';
import { GiangVien } from 'src/giang-vien/entities/giang-vien.entity';

@Module({
  imports:[TypeOrmModule.forFeature([NguoiDung, SinhVien,GiangVien])],
  controllers: [NguoiDungController],
  providers: [NguoiDungService],
  exports: [NguoiDungService]
})
export class NguoiDungModule {}

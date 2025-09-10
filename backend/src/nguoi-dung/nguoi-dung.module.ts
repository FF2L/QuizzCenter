import { Module } from '@nestjs/common';
import { NguoiDungService } from './nguoi-dung.service';
import { NguoiDungController } from './nguoi-dung.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NguoiDung } from './entities/nguoi-dung.entity';

@Module({
  imports:[TypeOrmModule.forFeature([NguoiDung])],
  controllers: [NguoiDungController],
  providers: [NguoiDungService],
  exports: [NguoiDungService]
})
export class NguoiDungModule {}

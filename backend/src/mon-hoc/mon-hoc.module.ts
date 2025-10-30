import { Module } from '@nestjs/common';
import { MonHocService } from './mon-hoc.service';
import { MonHocController } from './mon-hoc.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonHoc } from './entities/mon-hoc.entity';
import { GiangVien } from 'src/giang-vien/entities/giang-vien.entity';


@Module({
  imports:[TypeOrmModule.forFeature([MonHoc, GiangVien])],
  controllers: [MonHocController],
  providers: [MonHocService],
  exports: [MonHocService]
})
export class MonHocModule {}

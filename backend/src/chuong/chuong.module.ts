import { Module } from '@nestjs/common';
import { ChuongService } from './chuong.service';
import { ChuongController } from './chuong.controller';
import { GiangVienService } from 'src/giang-vien/giang-vien.service';
import { MonHocService } from 'src/mon-hoc/mon-hoc.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chuong } from './entities/chuong.entity';
import { GiangVienModule } from 'src/giang-vien/giang-vien.module';
import { MonHocModule } from 'src/mon-hoc/mon-hoc.module';

@Module({
  imports:[TypeOrmModule.forFeature([Chuong]),
    MonHocModule,
    GiangVienModule,
],
  controllers: [ChuongController],
  providers: [ChuongService],
  exports: [ChuongService]
})
export class ChuongModule {}

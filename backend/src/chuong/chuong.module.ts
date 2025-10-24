import { forwardRef, Module } from '@nestjs/common';
import { ChuongService } from './chuong.service';
import { ChuongController } from './chuong.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chuong } from './entities/chuong.entity';
import { GiangVienModule } from 'src/giang-vien/giang-vien.module';
import { MonHocModule } from 'src/mon-hoc/mon-hoc.module';
import { CauHoiModule } from 'src/cau-hoi/cau-hoi.module';

@Module({
  imports:[TypeOrmModule.forFeature([Chuong]),
    MonHocModule,
    GiangVienModule,
    forwardRef(() => CauHoiModule)
],
  controllers: [ChuongController],
  providers: [ChuongService],
  exports: [ChuongService]
})
export class ChuongModule {}

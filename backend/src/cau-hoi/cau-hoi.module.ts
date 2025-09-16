import { forwardRef, Module } from '@nestjs/common';
import { CauHoiService } from './cau-hoi.service';
import { CauHoiController } from './cau-hoi.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CauHoi } from './entities/cau-hoi.entity';
import { ChuongModule } from 'src/chuong/chuong.module';
import { DapAnModule } from 'src/dap-an/dap-an.module';

@Module({
  imports: [TypeOrmModule.forFeature([CauHoi]),
    forwardRef(() => ChuongModule),
    forwardRef(()=>DapAnModule)
],
  controllers: [CauHoiController],
  providers: [CauHoiService],
  exports: [CauHoiService]
})
export class CauHoiModule {}

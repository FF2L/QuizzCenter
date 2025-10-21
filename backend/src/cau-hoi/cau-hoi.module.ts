import { forwardRef, Module } from '@nestjs/common';
import { CauHoiService } from './cau-hoi.service';
import { CauHoiController } from './cau-hoi.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CauHoi } from './entities/cau-hoi.entity';
import { ChuongModule } from 'src/chuong/chuong.module';
import { DapAnModule } from 'src/dap-an/dap-an.module';
import { DapAn } from 'src/dap-an/entities/dap-an.entity';
import { GuiFile } from 'src/gui-file/entities/gui-file.entity';
import { GuiFileModule } from 'src/gui-file/gui-file.module';

@Module({
  imports: [TypeOrmModule.forFeature([CauHoi,DapAn,GuiFile]),
    forwardRef(() => ChuongModule),
    forwardRef(()=>DapAnModule),
    GuiFileModule

],
  controllers: [CauHoiController],
  providers: [CauHoiService],
  exports: [CauHoiService]
})
export class CauHoiModule {}

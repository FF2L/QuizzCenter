import { Module } from '@nestjs/common';
import { GuiFileService } from './gui-file.service';
import { GuiFileController } from './gui-file.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DapAn } from 'src/dap-an/entities/dap-an.entity';
import { CauHoi } from 'src/cau-hoi/entities/cau-hoi.entity';
import { Chuong } from 'src/chuong/entities/chuong.entity';
import { CloudinaryProvider } from 'src/config/cloudianry.config';

@Module({
  imports: [TypeOrmModule.forFeature([DapAn, CauHoi, Chuong])],
  controllers: [GuiFileController],
  providers: [GuiFileService, CloudinaryProvider],
  exports: [GuiFileService]
})
export class GuiFileModule {}

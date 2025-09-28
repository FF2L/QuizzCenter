import { Module } from '@nestjs/common';
import { GuiFileService } from './gui-file.service';
import { GuiFileController } from './gui-file.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DapAn } from 'src/dap-an/entities/dap-an.entity';
import { CauHoi } from 'src/cau-hoi/entities/cau-hoi.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DapAn, CauHoi])],
  controllers: [GuiFileController],
  providers: [GuiFileService],
})
export class GuiFileModule {}

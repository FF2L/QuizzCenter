import { TypeOrmModule } from '@nestjs/typeorm';
import { forwardRef, Module } from '@nestjs/common';
import { FileDinhKemService } from './file-dinh-kem.service';
import { FileDinhKemController } from './file-dinh-kem.controller';
import { CauHoiModule } from 'src/cau-hoi/cau-hoi.module';
import { GuiFileModule } from 'src/gui-file/gui-file.module';
import { FileDinhKem } from './entities/file-dinh-kem.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FileDinhKem]),
  forwardRef(()=>CauHoiModule),
   GuiFileModule],
  controllers: [FileDinhKemController],
  providers: [FileDinhKemService],
  exports: [FileDinhKemService]
})
export class FileDinhKemModule {}

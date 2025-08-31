import { Module } from '@nestjs/common';
import { FileDinhKemService } from './file-dinh-kem.service';
import { FileDinhKemController } from './file-dinh-kem.controller';

@Module({
  controllers: [FileDinhKemController],
  providers: [FileDinhKemService],
})
export class FileDinhKemModule {}

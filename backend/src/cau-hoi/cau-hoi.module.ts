import { Module } from '@nestjs/common';
import { CauHoiService } from './cau-hoi.service';
import { CauHoiController } from './cau-hoi.controller';

@Module({
  controllers: [CauHoiController],
  providers: [CauHoiService],
})
export class CauHoiModule {}

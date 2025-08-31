import { Module } from '@nestjs/common';
import { ChuongService } from './chuong.service';
import { ChuongController } from './chuong.controller';

@Module({
  controllers: [ChuongController],
  providers: [ChuongService],
})
export class ChuongModule {}

import { Module } from '@nestjs/common';
import { MonHocService } from './mon-hoc.service';
import { MonHocController } from './mon-hoc.controller';

@Module({
  controllers: [MonHocController],
  providers: [MonHocService],
})
export class MonHocModule {}

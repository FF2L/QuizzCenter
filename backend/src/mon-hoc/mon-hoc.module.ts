import { Module } from '@nestjs/common';
import { MonHocService } from './mon-hoc.service';
import { MonHocController } from './mon-hoc.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MonHoc } from './entities/mon-hoc.entity';
import { MonHocV2Controller } from './mon-hoc-v2.controller';

@Module({
  imports:[TypeOrmModule.forFeature([MonHoc])],
  controllers: [MonHocController,MonHocV2Controller],
  providers: [MonHocService],
  exports: [MonHocService]
})
export class MonHocModule {}

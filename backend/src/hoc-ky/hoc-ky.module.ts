import { Module } from '@nestjs/common';
import { HocKyService } from './hoc-ky.service';
import { HocKyController } from './hoc-ky.controller';
import { HocKy } from './entities/hoc-ky.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([HocKy])],
  controllers: [HocKyController],
  providers: [HocKyService],
})
export class HocKyModule {}

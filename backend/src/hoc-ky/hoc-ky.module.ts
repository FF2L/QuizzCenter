import { Module } from '@nestjs/common';
import { HocKyService } from './hoc-ky.service';
import { HocKyController } from './hoc-ky.controller';
import { HocKy } from './entities/hoc-ky.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LopHocPhan } from 'src/lop-hoc-phan/entities/lop-hoc-phan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HocKy, LopHocPhan])],
  controllers: [HocKyController],
  providers: [HocKyService],
})
export class HocKyModule {}

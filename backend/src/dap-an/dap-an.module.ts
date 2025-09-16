import { forwardRef, Module } from '@nestjs/common';
import { DapAnService } from './dap-an.service';
import { DapAnController } from './dap-an.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DapAn } from './entities/dap-an.entity';
import { CauHoiModule } from 'src/cau-hoi/cau-hoi.module';

@Module({
  imports: [TypeOrmModule.forFeature([DapAn]),
    forwardRef(()=>CauHoiModule)
],
  controllers: [DapAnController],
  providers: [DapAnService],
  exports: [DapAnService]
})
export class DapAnModule {}

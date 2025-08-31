import { Module } from '@nestjs/common';
import { DapAnService } from './dap-an.service';
import { DapAnController } from './dap-an.controller';

@Module({
  controllers: [DapAnController],
  providers: [DapAnService],
})
export class DapAnModule {}

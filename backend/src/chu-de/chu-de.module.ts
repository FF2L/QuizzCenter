import { Module } from '@nestjs/common';
import { ChuDeService } from './chu-de.service';
import { ChuDeController } from './chu-de.controller';

@Module({
  controllers: [ChuDeController],
  providers: [ChuDeService],
})
export class ChuDeModule {}

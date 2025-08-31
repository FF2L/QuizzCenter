import { Module } from '@nestjs/common';
import { KhoaService } from './khoa.service';
import { KhoaController } from './khoa.controller';

@Module({
  controllers: [KhoaController],
  providers: [KhoaService],
})
export class KhoaModule {}

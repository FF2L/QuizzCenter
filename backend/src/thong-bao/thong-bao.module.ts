import { Module } from '@nestjs/common';
import { ThongBaoService } from './thong-bao.service';
import { ThongBaoController } from './thong-bao.controller';

@Module({
  controllers: [ThongBaoController],
  providers: [ThongBaoService],
})
export class ThongBaoModule {}

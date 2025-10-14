import { Module } from '@nestjs/common';
import { ThongBaoService } from './thong-bao.service';
import { ThongBaoController } from './thong-bao.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThongBao } from './entities/thong-bao.entity';
import { ThongBaoNguoiDung } from './entities/thong-bao_nguoi-dung.entity';

@Module({
  imports:[TypeOrmModule.forFeature([ThongBao,ThongBaoNguoiDung])],
  controllers: [ThongBaoController],
  providers: [ThongBaoService],
  exports:[ThongBaoService]
})
export class ThongBaoModule {}

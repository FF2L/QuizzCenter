import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ThongBaoService } from './thong-bao.service';
import { CreateThongBaoDto } from './dto/create-thong-bao.dto';
import { UpdateThongBaoDto } from './dto/update-thong-bao.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { Pagination } from 'src/common/dto/pagination.dto';

@Controller('thong-bao')
export class ThongBaoController {
  constructor(private readonly thongBaoService: ThongBaoService) {}

  @Post()
  create(@Body() createThongBaoDto: CreateThongBaoDto) {
    return this.thongBaoService.create(createThongBaoDto);
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  async layTatCaThongBaoCuaNguoiDung(@Req() req, @Query() pageDto: Pagination) {
    return await this.thongBaoService.layTatCaThongBaoCuaNguoiDung(req.user.id, pageDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateThongBaoDto: UpdateThongBaoDto) {
    return this.thongBaoService.update(+id, updateThongBaoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.thongBaoService.remove(+id);
  }
}

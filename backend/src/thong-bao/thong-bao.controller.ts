import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ThongBaoService } from './thong-bao.service';
import { CreateThongBaoDto } from './dto/create-thong-bao.dto';
import { UpdateThongBaoDto } from './dto/update-thong-bao.dto';

@Controller('thong-bao')
export class ThongBaoController {
  constructor(private readonly thongBaoService: ThongBaoService) {}

  @Post()
  create(@Body() createThongBaoDto: CreateThongBaoDto) {
    return this.thongBaoService.create(createThongBaoDto);
  }

  @Get()
  findAll() {
    return this.thongBaoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.thongBaoService.findOne(+id);
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

import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BaiLamSinhVienService } from './bai-lam-sinh-vien.service';
import { CreateBaiLamSinhVienDto } from './dto/create-bai-lam-sinh-vien.dto';
import { UpdateBaiLamSinhVienDto } from './dto/update-bai-lam-sinh-vien.dto';

@Controller('bai-lam-sinh-vien')
export class BaiLamSinhVienController {
  constructor(private readonly baiLamSinhVienService: BaiLamSinhVienService) {}

  @Post()
  create(@Body() createBaiLamSinhVienDto: CreateBaiLamSinhVienDto) {
    return this.baiLamSinhVienService.create(createBaiLamSinhVienDto);
  }

  @Get()
  findAll() {
    return this.baiLamSinhVienService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.baiLamSinhVienService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBaiLamSinhVienDto: UpdateBaiLamSinhVienDto) {
    return this.baiLamSinhVienService.update(+id, updateBaiLamSinhVienDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.baiLamSinhVienService.remove(+id);
  }
}

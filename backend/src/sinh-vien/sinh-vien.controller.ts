import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SinhVienService } from './sinh-vien.service';
import { CreateSinhVienDto } from './dto/create-sinh-vien.dto';
import { UpdateSinhVienDto } from './dto/update-sinh-vien.dto';

@Controller('sinh-vien')
export class SinhVienController {
  constructor(private readonly sinhVienService: SinhVienService) {}

  @Post()
  create(@Body() createSinhVienDto: CreateSinhVienDto) {
    return this.sinhVienService.create(createSinhVienDto);
  }

  @Get()
  findAll() {
    return this.sinhVienService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sinhVienService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSinhVienDto: UpdateSinhVienDto) {
    return this.sinhVienService.update(+id, updateSinhVienDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sinhVienService.remove(+id);
  }
}

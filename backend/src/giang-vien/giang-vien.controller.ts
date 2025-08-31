import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GiangVienService } from './giang-vien.service';
import { CreateGiangVienDto } from './dto/create-giang-vien.dto';
import { UpdateGiangVienDto } from './dto/update-giang-vien.dto';

@Controller('giang-vien')
export class GiangVienController {
  constructor(private readonly giangVienService: GiangVienService) {}

  @Post()
  create(@Body() createGiangVienDto: CreateGiangVienDto) {
    return this.giangVienService.create(createGiangVienDto);
  }

  @Get()
  findAll() {
    return this.giangVienService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.giangVienService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGiangVienDto: UpdateGiangVienDto) {
    return this.giangVienService.update(+id, updateGiangVienDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.giangVienService.remove(+id);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { KhoaService } from './khoa.service';
import { CreateKhoaDto } from './dto/create-khoa.dto';
import { UpdateKhoaDto } from './dto/update-khoa.dto';

@Controller('khoa')
export class KhoaController {
  constructor(private readonly khoaService: KhoaService) {}

  @Post()
  create(@Body() createKhoaDto: CreateKhoaDto) {
    return this.khoaService.create(createKhoaDto);
  }

  @Get()
  findAll() {
    return this.khoaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.khoaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateKhoaDto: UpdateKhoaDto) {
    return this.khoaService.update(+id, updateKhoaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.khoaService.remove(+id);
  }
}

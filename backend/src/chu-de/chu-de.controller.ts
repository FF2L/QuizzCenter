import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChuDeService } from './chu-de.service';
import { CreateChuDeDto } from './dto/create-chu-de.dto';
import { UpdateChuDeDto } from './dto/update-chu-de.dto';

@Controller('chu-de')
export class ChuDeController {
  constructor(private readonly chuDeService: ChuDeService) {}

  @Post()
  create(@Body() createChuDeDto: CreateChuDeDto) {
    return this.chuDeService.create(createChuDeDto);
  }

  @Get()
  findAll() {
    return this.chuDeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chuDeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChuDeDto: UpdateChuDeDto) {
    return this.chuDeService.update(+id, updateChuDeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chuDeService.remove(+id);
  }
}

import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MonHocService } from './mon-hoc.service';
import { CreateMonHocDto } from './dto/create-mon-hoc.dto';
import { UpdateMonHocDto } from './dto/update-mon-hoc.dto';

@Controller('mon-hoc')
export class MonHocController {
  constructor(private readonly monHocService: MonHocService) {}

  @Post()
  create(@Body() createMonHocDto: CreateMonHocDto) {
    return this.monHocService.create(createMonHocDto);
  }

  @Get()
  findAll() {
    return this.monHocService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.monHocService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMonHocDto: UpdateMonHocDto) {
    return this.monHocService.update(+id, updateMonHocDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.monHocService.remove(+id);
  }
}

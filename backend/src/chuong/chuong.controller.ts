import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ChuongService } from './chuong.service';
import { CreateChuongDto } from './dto/create-chuong.dto';
import { UpdateChuongDto } from './dto/update-chuong.dto';

@Controller('chuong')
export class ChuongController {
  constructor(private readonly chuongService: ChuongService) {}

  @Post()
  create(@Body() createChuongDto: CreateChuongDto) {
    return this.chuongService.create(createChuongDto);
  }

  @Get()
  findAll() {
    return this.chuongService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chuongService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChuongDto: UpdateChuongDto) {
    return this.chuongService.update(+id, updateChuongDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chuongService.remove(+id);
  }
}

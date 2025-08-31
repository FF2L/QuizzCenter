import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BaiKiemTraService } from './bai-kiem-tra.service';
import { CreateBaiKiemTraDto } from './dto/create-bai-kiem-tra.dto';
import { UpdateBaiKiemTraDto } from './dto/update-bai-kiem-tra.dto';

@Controller('bai-kiem-tra')
export class BaiKiemTraController {
  constructor(private readonly baiKiemTraService: BaiKiemTraService) {}

  @Post()
  create(@Body() createBaiKiemTraDto: CreateBaiKiemTraDto) {
    return this.baiKiemTraService.create(createBaiKiemTraDto);
  }

  @Get()
  findAll() {
    return this.baiKiemTraService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.baiKiemTraService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBaiKiemTraDto: UpdateBaiKiemTraDto) {
    return this.baiKiemTraService.update(+id, updateBaiKiemTraDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.baiKiemTraService.remove(+id);
  }
}

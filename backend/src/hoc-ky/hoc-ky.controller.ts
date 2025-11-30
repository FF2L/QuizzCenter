import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { HocKyService } from './hoc-ky.service';
import { CreateHocKyDto } from './dto/create-hoc-ky.dto';
import { UpdateHocKyDto } from './dto/update-hoc-ky.dto';

@Controller('hoc-ky')
export class HocKyController {
  constructor(private readonly hocKyService: HocKyService) {}

  @Post('admin')
  create(@Body() createHocKyDto: CreateHocKyDto) {
    return this.hocKyService.create(createHocKyDto);
  }
  @Get('admin')
  findAll(@Query() tenHocKy: any) {
    console.log(tenHocKy);
    return this.hocKyService.findAll( tenHocKy.tenHocKy);
  }

  @Get('admin/dang-dien-ra')
  findAllHocKyPhatHanh() {
    return this.hocKyService.findAllHocKyDangDienRaVaTuongLai();
  }

  @Get('admin/:id')
  findOne(@Param('id') id: string) {
    return this.hocKyService.findOne(+id);
  }

  @Patch('admin/:id')
  update(@Param('id') id: string, @Body() updateHocKyDto: UpdateHocKyDto) {
    return this.hocKyService.update(+id, updateHocKyDto);
  }

  @Delete('admin/:id')
  remove(@Param('id') id: string) {
    return this.hocKyService.remove(+id);
  }
}

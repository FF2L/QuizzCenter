import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { LopHocPhanService } from './lop-hoc-phan.service';
import { CreateLopHocPhanDto } from './dto/create-lop-hoc-phan.dto';
import { UpdateLopHocPhanDto } from './dto/update-lop-hoc-phan.dto';
import { FilterLopHocPhanQueryDto } from './dto/filte-lop-hoc-phan.dto';

@Controller('lop-hoc-phan')
export class LopHocPhanController {
  constructor(private readonly lopHocPhanService: LopHocPhanService) {}

  @Post()
  create(@Body() createLopHocPhanDto: CreateLopHocPhanDto) {
    return this.lopHocPhanService.create(createLopHocPhanDto);
  }

  @Get(':idMonHoc')
  async findAll(@Param('idMonHoc',ParseIntPipe) idMonHoc: number, @Query() filterLopHocPHan: FilterLopHocPhanQueryDto) {
    return await this.lopHocPhanService.layTatCaLopHocPhanTheoIdMonHocVaIdGiaoVien(idMonHoc, filterLopHocPHan);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.lopHocPhanService.findOne(+id);
  // }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLopHocPhanDto: UpdateLopHocPhanDto) {
    return this.lopHocPhanService.update(+id, updateLopHocPhanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lopHocPhanService.remove(+id);
  }
}

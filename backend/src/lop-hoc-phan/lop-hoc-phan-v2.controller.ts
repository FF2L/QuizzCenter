import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { LopHocPhanService } from './lop-hoc-phan.service';
import { CreateLopHocPhanDto } from './dto/create-lop-hoc-phan.dto';
import { UpdateLopHocPhanDto } from './dto/update-lop-hoc-phan.dto';
import { FilterLopHocPhanQueryDto } from './dto/filte-lop-hoc-phan.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/common/decorations/roles.decorator';
import { Role } from 'src/common/enum/role.enum';
import { Pagination } from 'src/common/dto/pagination.dto';
import { FilterLopHocPhanSinhVienDto } from './dto/filter-lop-hoc-phan-sv.dto';

@Controller('v2/lop-hoc-phan')
export class LopHocPhanV2Controller {
  constructor(private readonly lopHocPhanService: LopHocPhanService) {}

  @Post()
  create(@Body() createLopHocPhanDto: CreateLopHocPhanDto) {
    return this.lopHocPhanService.create(createLopHocPhanDto);
  }

  @Get(':idMonHoc')
  async findAll(@Param('idMonHoc',ParseIntPipe) idMonHoc: number, @Query() filterLopHocPHan: FilterLopHocPhanQueryDto) {
    return await this.lopHocPhanService.layTatCaLopHocPhanTheoIdMonHocVaIdGiaoVien(idMonHoc, filterLopHocPHan);
  }
  @Roles(Role.SinhVien)
  @UseGuards(RolesGuard)
  @UseGuards((JwtAuthGuard))
  @Get()
  async layTatCaLopHocPhanCuaSinhVien(@Req() req, @Query() lhpSVDto: FilterLopHocPhanSinhVienDto){
    return await this.lopHocPhanService.layTatCaLopHocPhanCuaSinhVien(lhpSVDto,req.user.id);
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

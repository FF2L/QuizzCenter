import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { LopHocPhanService } from './lop-hoc-phan.service';
import { CreateLopHocPhanDto } from './dto/create-lop-hoc-phan.dto';
import { UpdateLopHocPhanDto } from './dto/update-lop-hoc-phan.dto';
import { Roles } from 'src/common/decorations/roles.decorator';
import { FilterLopHocPhanSinhVienDto } from './dto/filter-lop-hoc-phan-sv.dto';
import { Role } from 'src/common/enum/role.enum';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { skip } from 'node:test';

@Controller('lop-hoc-phan')
export class LopHocPhanController {
  constructor(private readonly lopHocPhanService: LopHocPhanService) {}

  @Post()
  create(@Body() createLopHocPhanDto: CreateLopHocPhanDto) {
    return this.lopHocPhanService.create(createLopHocPhanDto);
  }

  //Lấy tất cả lớp học phần của giảng viên lọc theo 
  @UseGuards((JwtAuthGuard))
  @Get('giang-vien')
  async layTatCaLopHocPhanCuaGianVien(
    @Req() req,
    @Query('skip') skip?: number,
    @Query('limit') limit?: number,
    @Query('giang-day') giangDay?: number,
    @Query ('ten-mon-hoc') tenMonHoc?: string
  ){
    return await this.lopHocPhanService.layTatCaLopHocPhanTheoIdGiaoVien(req.user.id, {
      skip,
      limit,
      giangDay,
      tenMonHoc
    });
  }
  //lấy Bảng điểm chi tiết theo lớp
  @Get(':idLopHocPhan/bang-diem')
  async layBangDiemCuaTatCaSinhVienCoTrongLopHocPhan(@Param('idLopHocPhan') idLopHocPhan: number){
    return await this.lopHocPhanService.layBangDiemChiTietTheoLop(idLopHocPhan);
  }

  // //Xuất bảng điểm
  // @Get(':idLopHocPhan/xuat-bang-diem')
  // async xuatBangDiem(@Param('idLopHocPhan') idLopHocPhan: number){
  //   const buffer = await this.lopHocPhanService.xuatBangDiem(idLopHocPhan);
    
  // }

  //Lấy tất cả lớp học phần của sinh viên
  @UseGuards((JwtAuthGuard))
  @Get()
  async layTatCaLopHocPhanCuaSinhVien(@Req() req, @Query() lhpSVDto: FilterLopHocPhanSinhVienDto){
    return await this.lopHocPhanService.layTatCaLopHocPhanCuaSinhVien(lhpSVDto,req.user.id);
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLopHocPhanDto: UpdateLopHocPhanDto) {
    return this.lopHocPhanService.update(+id, updateLopHocPhanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lopHocPhanService.remove(+id);
  }
}

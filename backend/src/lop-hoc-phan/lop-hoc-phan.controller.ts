import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards, Req, Res, Put } from '@nestjs/common';
import { LopHocPhanService } from './lop-hoc-phan.service';
import { CreateLopHocPhanDto } from './dto/create-lop-hoc-phan.dto';
import { UpdateLopHocPhanDto } from './dto/update-lop-hoc-phan.dto';
import { Roles } from 'src/common/decorations/roles.decorator';
import { FilterLopHocPhanSinhVienDto } from './dto/filter-lop-hoc-phan-sv.dto';
import { Role } from 'src/common/enum/role.enum';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { skip } from 'node:test';
import { Response } from 'express';

@Controller('lop-hoc-phan')
export class LopHocPhanController {
  constructor(private readonly lopHocPhanService: LopHocPhanService) {}

  //CRUD Lớp học phần Admin
  @Get('all/admin')
  async layTatCaLopHocPhanAdmin(
    @Query('skip') skip?: number,
    @Query('limit') limit?: number,
    @Query ('ten-lop-hoc') tenLopHoc?: string,
  ) {
    return await this.lopHocPhanService.layTatCaLopHocPhanAdmin({
      skip,
      limit,
      tenLopHoc
    });
  }
  @Post('admin')
  async taoLopHocPhan(@Body() createLopHocPhanDto: CreateLopHocPhanDto) {
    return await this.lopHocPhanService.taoLopHocPhan(createLopHocPhanDto);
  }
  @Put(':id/admin')
  async capNhatLopHocPhan(@Param('id') id: number, @Body() updateLopHocPhanDto: UpdateLopHocPhanDto) {
    return await this.lopHocPhanService.capNhatLopHocPhan(id, updateLopHocPhanDto);
  }
  @Delete(':id/admin')
  async xoaLopHocPhan(@Param('id') id: number) {
    return await this.lopHocPhanService.xoaLopHocPhan(id);
  }
  @Get(':id/admin')
  async layTatCaSinhVienCuaLopHocPhan(@Param('id') id: number,
  @Query('skip') skip?: number,
  @Query('limit') limit?: number,
  @Query ('ten-sinh-vien') tenSinhVien?: string

) {
    return await this.lopHocPhanService.layTatCaSinhVienCuaLopHocPhan(id, {skip, limit, tenSinhVien});
  }
  @Post(':idLopHocPhan/sinh-vien/:maSinhVien/admin')
  async themSinhVienVaoLopHocPhan(@Param('idLopHocPhan') idLopHocPhan: number, @Param('maSinhVien') maSinhVien: string) {
    return await this.lopHocPhanService.themSinhVienVaoLopHocPhan(idLopHocPhan, maSinhVien);
  }

  @Delete(':idLopHocPhan/sinh-vien/:maSinhVien/admin')
  async xoaSinhVienKhoiLopHocPhan(@Param('idLopHocPhan') idLopHocPhan: number, @Param('maSinhVien') maSinhVien: string) {
    return await this.lopHocPhanService.xoaSinhVienKhoiLopHocPhan(idLopHocPhan, maSinhVien);
  }

  //End CRUD Lớp học phần Admin

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
    console.log('tenMonHoc', tenMonHoc)
    return await this.lopHocPhanService.layTatCaLopHocPhanTheoIdGiaoVien(req.user.id, {
      skip,
      limit,
      giangDay,
      tenMonHoc
    });
  }

  @UseGuards((JwtAuthGuard))
  @Get('giang-vien/dang-day')
  async layTatCaLopHocPhanDangDayCuaGiaoVien(@Req() req) {
    return await this.lopHocPhanService.layTatCaLopHocPhanDangDayCuaGiaoVien(req.user.id);
  }

  @Get('danh-sach-bai-kiem-tra/:idLopHocPhan')
  async layDanhSachBaiKiemTra(@Param('idLopHocPhan') idLopHocPhan: number) {
    return await this.lopHocPhanService.layDanhSachBaiKiemTra(idLopHocPhan);
  }

  //lấy Bảng điểm chi tiết theo lớp
  @Get(':idLopHocPhan/bang-diem')
  async layBangDiemCuaTatCaSinhVienCoTrongLopHocPhan(@Param('idLopHocPhan') idLopHocPhan: number,
   @Query('skip') skip?: number,
  @Query('limit') limit?: number,
  @Query ('ten-sinh-vien') tenSinhVien?: string){
    return await this.lopHocPhanService.layBangDiemChiTietTheoLop(idLopHocPhan, {skip, limit, tenSinhVien});
  }

  //Xuất bảng điểm
  @Get(':idLopHocPhan/xuat-bang-diem/:tenLopHocPhan')
  async xuatBangDiem(@Param('idLopHocPhan') idLopHocPhan: number, @Param('tenLopHocPhan') tenLopHocPhan: string, @Res() res: Response){
    const buffer = await this.lopHocPhanService.exportBangDiemExcel(idLopHocPhan);
    const filename = `BangDiem_${tenLopHocPhan}.xlsx`;
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);

  }

  //Lấy tất cả lớp học phần của sinh viên
  @UseGuards((JwtAuthGuard))
  @Get('sinh-vien')
  async layTatCaLopHocPhanCuaSinhVien(@Req() req, @Query() lhpSVDto: FilterLopHocPhanSinhVienDto){
    return await this.lopHocPhanService.layTatCaLopHocPhanCuaSinhVien(lhpSVDto,req.user.id);
  }


}

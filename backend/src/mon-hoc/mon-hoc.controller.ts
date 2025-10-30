import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, Put } from '@nestjs/common';
import { MonHocService } from './mon-hoc.service';
import { CreateMonHocDto } from './dto/create-mon-hoc.dto';
import { UpdateMonHocDto } from './dto/update-mon-hoc.dto';
import { Pagination } from 'src/common/dto/pagination.dto';
import { Roles } from 'src/common/decorations/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { Role } from 'src/common/enum/role.enum';
import { skip } from 'node:test';
import { UpdatePhanCongMonHocDto } from './dto/update-phan-cong-mon-hoc';

@Controller('mon-hoc')
export class MonHocController {
  constructor(private readonly monHocService: MonHocService) {}


//CRUD môn học Admin
  @Get('admin')
  async findAllAdmin(@Query('skip') skip?: number, @Query('limit') limit?: number, @Query('tenMon') tenMon?: string){
    return await this.monHocService.layTatCaMonHoc({ skip, limit, tenMon });
  }
  @Post('admin')
  create(@Body() createMonHocDto: CreateMonHocDto) {
    return this.monHocService.create(createMonHocDto);
  }
  @Get(':id/admin')
  findOne(@Param('id') id: string) {
    return this.monHocService.findOne(+id);
  }
  @Put('phan-cong/admin')
  phanCongChoGiangVien(@Body() dto: UpdatePhanCongMonHocDto) {
    return this.monHocService.phanCongChoGiangVien(dto);
  }
  @Put(':id/admin')
  update(@Param('id') id: string, @Body() updateMonHocDto: UpdateMonHocDto) {
    return this.monHocService.update(+id, updateMonHocDto);
  }
  @Delete(':id/admin')
  remove(@Param('id') id: string) {
    return this.monHocService.remove(+id);
  }

  @Get('da-phan-cong/giang-vien/:idGiangVien/admin')
  async layDanhSachMonHocDaPhanCong(@Param('idGiangVien') idGiangVien: string){
    return this.monHocService.layTatCaMonHocGiangVienDaDcPhanCong(+idGiangVien)
  }
//End CRUD môn học Admin

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req, @Query('skip') skip: number, @Query('limit') limit: number, @Query('maMon') maMon: string, @Query('tenMon') tenMon: string) {
    return await this.monHocService.layTatCaMonHocCuaGiangVien({ skip, limit, maMon, tenMon }, req.user.id);
  }

}


import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, ParseIntPipe, ParseEnumPipe } from '@nestjs/common';
import { ChuongService } from './chuong.service';
import { CreateChuongDto } from './dto/create-chuong.dto';
import { UpdateChuongDto } from './dto/update-chuong.dto';
import { FindAllChuongDto } from './dto/findAll-chuong.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { Pagination } from 'src/common/dto/pagination.dto';
import { LoaiCauHoi } from 'src/common/enum/loaicauhoi.enum';
import { DoKho } from 'src/common/enum/dokho.enum';
import { FilterCauHoiQueryDto } from 'src/cau-hoi/dto/filter_cau-hoi_query.dto';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/common/decorations/roles.decorator';
import { Role } from 'src/common/enum/role.enum';

@Controller('v2/chuong')
export class ChuongV2Controller {
  constructor(private readonly chuongService: ChuongService) {}

  @Roles(Role.GiaoVien)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createChuongDto: CreateChuongDto, @Req() req) {
    return await this.chuongService.taoMotChuongV2(createChuongDto,req.user.id);
  }

  @Roles(Role.GiaoVien)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Get('mon-hoc/:idMonHoc')
  async findAll(@Param('idMonHoc', ParseIntPipe) idMonHoc : number, @Req() req ) {
    return await this.chuongService.timTatCaChuongTheoIdMonHocV2(idMonHoc, req.user.id );

  }
  
  @Roles(Role.GiaoVien)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.chuongService.timMotChuongTheoId(id);
  }

  @Roles(Role.GiaoVien)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Get(':id/cau-hoi')
  async layTatCaCauHoiTheoChuong(
    @Param('id', ParseIntPipe) idChuong: number, 
    @Query() filterCauHoiDto :FilterCauHoiQueryDto)
  {
    return await this.chuongService.layTatCauHoiTheoChuong(idChuong, filterCauHoiDto)
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateChuongDto: UpdateChuongDto) {
    return await this.chuongService.capNhatChuong(+id, updateChuongDto);
  }


  @Delete(':id')
  async remove(@Param('id',ParseIntPipe) id: number) {
    return this.chuongService.xoaChuongTheoIdChuong(id);
  }
}


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
import { Roles } from 'src/common/decorations/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Role } from 'src/common/enum/role.enum';

@Controller('chuong')
export class ChuongController {
  constructor(private readonly chuongService: ChuongService) {}

  //tao chương mới 
  @Roles(Role.GiaoVien)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createChuongDto: CreateChuongDto, @Req() req) {
    console.log("Creating chapter:", createChuongDto);
    return await this.chuongService.taoMotChuong(createChuongDto,req.user.id);
  }

  // lấy tất cả chương theo môn học và người dùng

  @Roles(Role.GiaoVien)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query('idMonHoc', ParseIntPipe) idMonHoc : number, @Req() req) {
    return await this.chuongService.layTatCaChuongTheoMonHocVaNguoiDung(idMonHoc, req.user.id);

  }

  // lấy tất cả câu hỏi theo chương
  @Roles(Role.GiaoVien)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Get(':id/cau-hoi')
  async layTatCaCauHoiTheoChuong(
    @Param('id', ParseIntPipe) idChuong: number, 
    @Query('skip') skip?: number,
    @Query('limit') limit?: number,
    @Query('doKho') doKho?: DoKho,
    @Query('noiDungCauHoi') noiDungCauHoi?: string
  ) {
    return await this.chuongService.layTatCauHoiTheoChuong(idChuong, { skip, limit, doKho, noiDungCauHoi});
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateChuongDto: UpdateChuongDto) {
    return await this.chuongService.capNhatChuong(+id, updateChuongDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id',ParseIntPipe) id: number) {
    return this.chuongService.xoaChuongTheoIdChuong(id);
  }
}

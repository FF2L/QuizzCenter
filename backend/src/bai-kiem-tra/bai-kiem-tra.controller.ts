import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, Put, UseGuards } from '@nestjs/common';
import { BaiKiemTraService } from './bai-kiem-tra.service';
import { CreateBaiKiemTraDto } from './dto/create-bai-kiem-tra.dto';
import { UpdateBaiKiemTraDto } from './dto/update-bai-kiem-tra.dto';
import { Pagination } from 'src/common/dto/pagination.dto';
import { CreateChiTietBaiKiemTraDto } from './dto/create-chi-tiet-bai-kiem-tra.dto';
import { FilterChiTietBaiKiemTraDto } from './dto/filter-chi-tiet-bai-kiem-tra.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/common/decorations/roles.decorator';
import { Role } from 'src/common/enum/role.enum';

// @Roles(Role.GiaoVien)
// @UseGuards(RolesGuard)
// @UseGuards(JwtAuthGuard)
@Controller('bai-kiem-tra')
export class BaiKiemTraController {
  constructor(private readonly baiKiemTraService: BaiKiemTraService) {}
  /**CRUD bài kiểm tra */
  @Post()
  async create(@Body() createBaiKiemTraDto: CreateBaiKiemTraDto) {
    return await this.baiKiemTraService.taoBaiKiemTra(createBaiKiemTraDto);
  }

  @Get(':idLopHocPhan')
  async findAll(@Param('idLopHocPhan',ParseIntPipe) idlopHocPHan: number , @Query() filter: FilterChiTietBaiKiemTraDto) {
    return await this.baiKiemTraService.timTatCaBaiKiemTraTheoIdLopHocPhan(idlopHocPHan, filter);
  }

  @Get('/findone/:idBaiKiemTra')
  async findOne(@Param('idBaiKiemTra',ParseIntPipe) idBaiKiemTra: number) {
    return await this.baiKiemTraService.timMotBaiKiemTraTheoIdBaiKiemTra(idBaiKiemTra);
  }
    @Get(':idBaiKiemTra/mon-hoc')
  timMonHocTheoIdBaikiemTra(@Param(':idBaiKiemTra') idBaiKiemTra: number) {
    return this.baiKiemTraService.timMonHocTheoIdBaikiemTradOne(idBaiKiemTra);
  }


  @Patch(':idBaiKiemTra')
  async update(@Param('idBaiKiemTra', ParseIntPipe) idBaiKiemTra: number, @Body() updateBaiKiemTraDto: UpdateBaiKiemTraDto) {
    return await this.baiKiemTraService.capNhatBaiKiemTra(idBaiKiemTra, updateBaiKiemTraDto);
  }

  @Delete(':idBaiKiemTra')
  async remove(@Param('idBaiKiemTra',ParseIntPipe) idBaiKiemTra: number) {
    return await this.baiKiemTraService.xoaBaiKiemTRaTheoIdBaiKiemTRa(idBaiKiemTra);
  }

  /**CRUD câu hỏi trong bài kiểm tra */
  @Get('/chi-tiet-cau-hoi/:idBaiKiemTra')
  async layTatCaCauHoiBaiKiemTra(@Param('idBaiKiemTra',ParseIntPipe) idBaiKiemTra: number, pagination: Pagination ){
      return await this.baiKiemTraService.layTatCaCauHoiCoTrongBaiKiemTraTheoIdBaiKiemTra(idBaiKiemTra, pagination)
  }

  @Post('/chi-tiet-cau-hoi')
  async themMangCauHoiVaoTrongBaiKiemTra(@Body() createChiTietDto: CreateChiTietBaiKiemTraDto){
    return await this.baiKiemTraService.themMangCauHoiVaoTrongBaiKiemTra(createChiTietDto)
  }

  @Put('/chi-tiet-cau-hoi')
  async updateMangCauHoiCoTrongBaiKiemTra(@Body() createChiTietDto: CreateChiTietBaiKiemTraDto){
    return await this.baiKiemTraService.capNhatMangCauHoiCoTrongBaiKiemTra(createChiTietDto)
  }
  @Delete('/chi-tiet-cau-hoi/:idChiTietBaiKiemTra')
    async xoaMotCauHoiTrongChiTietCauHo(@Param('idChiTietBaiKiemTra',ParseIntPipe) idChiTietBaiKiemTra: number){
    return await this.baiKiemTraService.xoaCauHoiCoTrongBaiKiemTra(idChiTietBaiKiemTra)
  }


}

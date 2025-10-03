import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, Put } from '@nestjs/common';
import { BaiKiemTraService } from './bai-kiem-tra.service';
import { CreateBaiKiemTraDto } from './dto/create-bai-kiem-tra.dto';
import { UpdateBaiKiemTraDto } from './dto/update-bai-kiem-tra.dto';
import { Pagination } from 'src/common/dto/pagination.dto';
import { CreateChiTietBaiKiemTraDto } from './dto/create-chi-tiet-bai-kiem-tra.dto';

@Controller('bai-kiem-tra')
export class BaiKiemTraController {
  constructor(private readonly baiKiemTraService: BaiKiemTraService) {}
  /**CRUD bài kiểm tra */
  @Post()
  async create(@Body() createBaiKiemTraDto: CreateBaiKiemTraDto) {
    return await this.baiKiemTraService.taoBaiKiemTra(createBaiKiemTraDto);
  }

  @Get(':idLopHocPhan')
  async findAll(@Param('idLopHocPhan',ParseIntPipe) idlopHocPHan: number) {
    return await this.baiKiemTraService.timTatCaBaiKiemTraTheoIdLopHocPhan(idlopHocPHan);
  }

  @Get('/findone/:idBaiKiemTra')
  async findOne(@Param('idBaiKiemTra',ParseIntPipe) idBaiKiemTra: number) {
    return await this.baiKiemTraService.timMotBaiKiemTraTheoIdBaiKiemTra(idBaiKiemTra);
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
  async layTatCaCauHoiBaiKiemTra(@Param('idBaiKiemTra',ParseIntPipe) idBaiKiemTra: number, @Query() pagination: Pagination ){
      return await this.baiKiemTraService.layTatCaCauHoiCoTrongBaiKiemTraTheoIdBaiKiemTra(idBaiKiemTra, pagination)
  }

  @Post('/chi-tiet-cau-hoi')
  async themMangCauHoiVaoTrongBaiKiemTra(@Body() createChiTietDto: CreateChiTietBaiKiemTraDto){
    return await this.baiKiemTraService.themMangCauHoiVaoTrongBaiKiemTra(createChiTietDto)
  }

  @Put('/chi-tiet-cau-hoi')
  async xoaMangCauHoiCoTrongBaiKiemTra(@Body() createChiTietDto: CreateChiTietBaiKiemTraDto){
    return await this.baiKiemTraService.capNhatMangCauHoiCoTrongBaiKiemTra(createChiTietDto)
  }

}

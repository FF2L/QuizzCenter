import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { BaiKiemTraService } from './bai-kiem-tra.service';
import { CreateBaiKiemTraDto } from './dto/create-bai-kiem-tra.dto';
import { UpdateBaiKiemTraDto } from './dto/update-bai-kiem-tra.dto';

@Controller('bai-kiem-tra')
export class BaiKiemTraController {
  constructor(private readonly baiKiemTraService: BaiKiemTraService) {}

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
}

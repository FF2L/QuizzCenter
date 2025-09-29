
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

@Controller('chuong')
export class ChuongController {
  constructor(private readonly chuongService: ChuongService) {}

  @Post()
  async create(@Body() createChuongDto: CreateChuongDto) {
    return await this.chuongService.taoMotChuong(createChuongDto);
  }
  // @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Query('idMonHoc', ParseIntPipe) idMonHoc : number
  /**, @Req() req */) {
    return await this.chuongService.timTatCaChuongTheoIdMonHoc(idMonHoc/**, req.user.id */);

  }
  
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.chuongService.timMotChuongTheoId(id);
  }

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

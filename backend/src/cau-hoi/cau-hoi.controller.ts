import { Controller, Get, Post, Body, Patch, Param, ParseIntPipe, UseGuards, Delete } from '@nestjs/common';
import { CauHoiService } from './cau-hoi.service';
import { CreateCauHoiDto } from './dto/create-cau-hoi.dto';
import { UpdateCauHoiDto } from './dto/update-cau-hoi.dto';

import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

@Controller('cau-hoi')
export class CauHoiController {
  constructor(private readonly cauHoiService: CauHoiService) {}



  @Get(':id')
  async findOne(@Param('id',ParseIntPipe) id: number) {
    return await this.cauHoiService.timCauHoiTheoId(id);
  }


  @Post()
  async taoCauHoi(@Body() creaCauHoiDto: CreateCauHoiDto){
    return await this.cauHoiService.taoMotCauHoi(creaCauHoiDto);
  }

  @Post('danh-sach-cau-hoi/chuong/:idChuong')
  async taoDanhSachCauHoi(
    @Param('idChuong', ParseIntPipe) idChuong: number,
    @Body() createCauHoiDto: CreateCauHoiDto[],
  ) {
    return await this.cauHoiService.taoDanhSachCauHoi(idChuong, createCauHoiDto);
  }

  @Patch(':id')
  async update(@Param('id',ParseIntPipe) id: number, @Body() updateCauHoiDto: UpdateCauHoiDto,) {


    return await this.cauHoiService.capNhatCauHoi(id, updateCauHoiDto);
  }

  @Delete(':id')
  async remove(@Param('id',ParseIntPipe) id: number) {
    console.log(id)
    return await this.cauHoiService.remove(id);
  }
}

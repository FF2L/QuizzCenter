import { Controller, Get, Post, Body, Patch, Param, Delete,Query } from '@nestjs/common';
import { ChuongService } from './chuong.service';
import { CreateChuongDto } from './dto/create-chuong.dto';
import { UpdateChuongDto } from './dto/update-chuong.dto';
import { FindAllChuongDto } from './dto/findAll-chuong.dto';

@Controller('chuong')
export class ChuongController {
  constructor(private readonly chuongService: ChuongService) {}

  @Post()
  async create(@Body() createChuongDto: CreateChuongDto) {
    return await this.chuongService.taoMotChuong(createChuongDto);
  }

  @Get()
  async findAll(@Query('idMonHoc') idMonHoc: number) {
    return await this.chuongService.timTatCaChuongTheoIdMonHoc({ idMonHoc });
  }
  
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chuongService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateChuongDto: UpdateChuongDto) {
    return await this.chuongService.capNhatChuong(+id, updateChuongDto);
  }


  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chuongService.remove(+id);
  }
}

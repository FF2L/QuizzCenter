import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { CauHoiService } from './cau-hoi.service';
import { CreateCauHoiDto } from './dto/create-cau-hoi.dto';
import { UpdateCauHoiDto } from './dto/update-cau-hoi.dto';

@Controller('cau-hoi')
export class CauHoiController {
  constructor(private readonly cauHoiService: CauHoiService) {}

  @Post()
  async create(@Body() createCauHoiDto: CreateCauHoiDto) {
    return await this.cauHoiService.taoMotCauHoi(createCauHoiDto);
  }

  @Get()
  findAll() {
    return this.cauHoiService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id',ParseIntPipe) id: number) {
    return await this.cauHoiService.timCauHoiTheoId(id);
  }

  @Patch(':id')
  async update(@Param('id',ParseIntPipe) id: number, @Body() updateCauHoiDto: UpdateCauHoiDto) {
    return await this.cauHoiService.capNhatCauHoi(id, updateCauHoiDto);
  }

  @Delete(':id')
  remove(@Param('id',ParseIntPipe) id: number) {
    return this.cauHoiService.remove(id);
  }
}

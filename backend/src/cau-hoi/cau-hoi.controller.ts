import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CauHoiService } from './cau-hoi.service';
import { CreateCauHoiDto } from './dto/create-cau-hoi.dto';
import { UpdateCauHoiDto } from './dto/update-cau-hoi.dto';

@Controller('cau-hoi')
export class CauHoiController {
  constructor(private readonly cauHoiService: CauHoiService) {}

  @Post()
  create(@Body() createCauHoiDto: CreateCauHoiDto) {
    return this.cauHoiService.create(createCauHoiDto);
  }

  @Get()
  findAll() {
    return this.cauHoiService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cauHoiService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCauHoiDto: UpdateCauHoiDto) {
    return this.cauHoiService.update(+id, updateCauHoiDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cauHoiService.remove(+id);
  }
}

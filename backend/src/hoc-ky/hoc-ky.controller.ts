import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HocKyService } from './hoc-ky.service';
import { CreateHocKyDto } from './dto/create-hoc-ky.dto';
import { UpdateHocKyDto } from './dto/update-hoc-ky.dto';

@Controller('hoc-ky')
export class HocKyController {
  constructor(private readonly hocKyService: HocKyService) {}

  @Post('admin')
  create(@Body() createHocKyDto: CreateHocKyDto) {
    return this.hocKyService.create(createHocKyDto);
  }

  @Get('admin')
  findAll() {
    return this.hocKyService.findAll();
  }

  @Get('admin/phat-hanh')
  findAllHocKyPhatHanh() {
    return this.hocKyService.findAllHocKyPhatHanh();
  }

  @Patch('admin/:id')
  update(@Param('id') id: string, @Body() updateHocKyDto: UpdateHocKyDto) {
    return this.hocKyService.update(+id, updateHocKyDto);
  }

  @Delete('admin/:id')
  remove(@Param('id') id: string) {
    return this.hocKyService.remove(+id);
  }
}

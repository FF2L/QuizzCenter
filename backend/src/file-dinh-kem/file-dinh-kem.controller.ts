import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FileDinhKemService } from './file-dinh-kem.service';
import { CreateFileDinhKemDto } from './dto/create-file-dinh-kem.dto';
import { UpdateFileDinhKemDto } from './dto/update-file-dinh-kem.dto';

@Controller('file-dinh-kem')
export class FileDinhKemController {
  constructor(private readonly fileDinhKemService: FileDinhKemService) {}

  @Post()
  create(@Body() createFileDinhKemDto: CreateFileDinhKemDto) {
    return this.fileDinhKemService.create(createFileDinhKemDto);
  }

  // @Get()
  // findAll() {
  //   return this.fileDinhKemService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.fileDinhKemService.findOne(+id);
  // }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFileDinhKemDto: UpdateFileDinhKemDto) {
    return this.fileDinhKemService.update(+id, updateFileDinhKemDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.fileDinhKemService.remove(+id);
  // }
}

import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { DapAnService } from './dap-an.service';

import { UpdateDapAnDto } from './dto/update-dap-an.dto';
import { CreateMotDapAn } from './dto/create-mot-dap-an.dto';

@Controller('dap-an')
export class DapAnController {
  constructor(private readonly dapAnService: DapAnService) {}

  @Post()
  async create(@Body() creatMotDapAnDto: CreateMotDapAn) {
    return await this.dapAnService.taoMotDapAn(creatMotDapAnDto);
  }

  @Patch(':id')
  update(@Param('id',ParseIntPipe) id: number, @Body() updateDapAnDto: UpdateDapAnDto) {
    return this.dapAnService.capNhatMotDapAn (id, updateDapAnDto);
  }

  @Delete(':id')
  async remove(@Param('id',ParseIntPipe) id: number) {
    return await this.dapAnService.xoaMotDApAnTheoIdDapAn(id);
  }
}

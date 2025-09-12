import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DapAnService } from './dap-an.service';
import { CreateDapAnDto } from './dto/create-dap-an.dto';
import { UpdateDapAnDto } from './dto/update-dap-an.dto';

@Controller('dap-an')
export class DapAnController {
  constructor(private readonly dapAnService: DapAnService) {}

  @Post()
  create(@Body() createDapAnDto: CreateDapAnDto) {
    return this.dapAnService.create(createDapAnDto);
  }

  @Get()
  findAll() {
    return this.dapAnService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dapAnService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDapAnDto: UpdateDapAnDto) {
    return this.dapAnService.update(+id, updateDapAnDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dapAnService.remove(+id);
  }
}

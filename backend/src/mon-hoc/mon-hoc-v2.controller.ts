import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { MonHocService } from './mon-hoc.service';
import { CreateMonHocDto } from './dto/create-mon-hoc.dto';
import { UpdateMonHocDto } from './dto/update-mon-hoc.dto';
import { Pagination } from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Role } from 'src/common/enum/role.enum';
import { Roles } from 'src/common/decorations/roles.decorator';

@Controller('v2/mon-hoc')
export class MonHocV2Controller {
  constructor(private readonly monHocService: MonHocService) {}

  @Post()
  create(@Body() createMonHocDto: CreateMonHocDto) {
    return this.monHocService.create(createMonHocDto);
  }
  @Roles(Role.GiaoVien)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req, @Query() pagination: Pagination) {
    return await this.monHocService.layTatCaMonHocV2(pagination,req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.monHocService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMonHocDto: UpdateMonHocDto) {
    return this.monHocService.update(+id, updateMonHocDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.monHocService.remove(+id);
  }
}

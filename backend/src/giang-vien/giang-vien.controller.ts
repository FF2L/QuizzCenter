import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { GiangVienService } from './giang-vien.service';
import { CreateGiangVienDto } from './dto/create-giang-vien.dto';
import { UpdateGiangVienDto } from './dto/update-giang-vien.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/common/decorations/roles.decorator';
import { Role } from 'src/common/enum/role.enum';

@Controller('giang-vien')
export class GiangVienController {
  constructor(private readonly giangVienService: GiangVienService) {}

  @Post()
  create(@Body() createGiangVienDto: CreateGiangVienDto) {
    return this.giangVienService.create(createGiangVienDto);
  }

  @Roles(Role.GiaoVien)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Get()
  findOne(@Req() req) {
    return this.giangVienService.timGiangVienTheoId(req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGiangVienDto: UpdateGiangVienDto) {
    return this.giangVienService.update(+id, updateGiangVienDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.giangVienService.remove(+id);
  }
}

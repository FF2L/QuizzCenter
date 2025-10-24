import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put } from '@nestjs/common';
import { NguoiDungService } from './nguoi-dung.service';
import { CreateNguoiDungDto } from './dto/create-nguoi-dung.dto';
import { UpdateNguoiDungDto } from './dto/update-nguoi-dung.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { UpdateMatKhauDto } from './dto/update-mat-khau.dto';

@Controller('nguoi-dung')
export class NguoiDungController {
  constructor(private readonly nguoiDungService: NguoiDungService) {}

  @Post()
  create(@Body() createNguoiDungDto: CreateNguoiDungDto) {
    return this.nguoiDungService.create(createNguoiDungDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req) {
    return await this.nguoiDungService.layThongTinCuaNguoiDung(req.user.id)
  }

  @UseGuards(JwtAuthGuard)
  @Patch('')
  update(@Req() req , @Body() updateNguoiDungDto: UpdateNguoiDungDto) {
    return this.nguoiDungService.update(req.user.id, updateNguoiDungDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put("mat-khau")
  updateMatKhau(@Req() req , @Body() updatematKhauDto: UpdateMatKhauDto) {
    return this.nguoiDungService.updateMatKhau(req.user.id, updatematKhauDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nguoiDungService.remove(+id);
  }
}

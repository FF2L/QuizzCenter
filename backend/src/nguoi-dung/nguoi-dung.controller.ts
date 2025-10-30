import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put, Query } from '@nestjs/common';
import { NguoiDungService } from './nguoi-dung.service';
import { CreateNguoiDungDto } from './dto/create-nguoi-dung.dto';
import { UpdateNguoiDungDto } from './dto/update-nguoi-dung.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { UpdateMatKhauDto } from './dto/update-mat-khau.dto';
import { UpdateNguoiDungAdminDto } from './dto/update-nguoi-dung-admin';

@Controller('nguoi-dung')
export class NguoiDungController {
  constructor(private readonly nguoiDungService: NguoiDungService) {}

//CRUD người dùng Admin
  @Post('admin')
  taoNguoiDungAdmin(@Body() createNguoiDungDto: CreateNguoiDungDto) {
    return this.nguoiDungService.taoNguoiDung(createNguoiDungDto);
  }

  @Put(':id/admin')
  updateNguoiDungAdmin(@Param('id') id: string, @Body() dto: UpdateNguoiDungAdminDto) {
    return this.nguoiDungService.updateNguoiDung(+id, dto);
  }

  @Delete(':id/admin')
  xoaNguoiDungAdmin(@Param('id') id: string) {
    return this.nguoiDungService.xoaNguoiDung(+id);
  }
  @Get('admin')
  timTatCaNguoiDung(@Query('skip') skip?: number, @Query('limit') limit?: number, @Query('tenNguoiDung') tenNguoiDung?: string) {
    return this.nguoiDungService.timTatCaNguoiDung({ skip, limit, tenNguoiDung });
  }

  @Get(':idNguoiDung/admin')
  timNguoiDungTheoId(@Param('idNguoiDung') idNguoiDung: string) {
    return this.nguoiDungService.layThongTinCuaNguoiDung(+idNguoiDung);
  }

//End CRUD người dùng Admin

  @UseGuards(JwtAuthGuard)
  @Get()
  async findOne(@Req() req) {
    return await this.nguoiDungService.layThongTinCuaNguoiDung(req.user.id)
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  update(@Req() req , @Body() updateNguoiDungDto: UpdateNguoiDungDto) {
    return this.nguoiDungService.update(req.user.id, updateNguoiDungDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put("mat-khau")
  updateMatKhau(@Req() req , @Body() updatematKhauDto: UpdateMatKhauDto) {
    return this.nguoiDungService.updateMatKhau(req.user.id, updatematKhauDto);
  }

}

import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Put, Query } from '@nestjs/common';
import { GiangVienService } from './giang-vien.service';
import { CreateGiangVienDto } from './dto/create-giang-vien.dto';
import { UpdateGiangVienDto } from './dto/update-giang-vien.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/common/decorations/roles.decorator';
import { Role } from 'src/common/enum/role.enum';
import { NguoiDungService } from 'src/nguoi-dung/nguoi-dung.service';

@Controller('giang-vien')
export class GiangVienController {
  constructor(private readonly giangVienService: GiangVienService,
    private readonly nguoiDungService: NguoiDungService
  ) {}


  @UseGuards(JwtAuthGuard)
  @Get()
  findOne(@Req() req) {
    return this.giangVienService.timGiangVienTheoId(req.user.id);
  }

  @Get('all/admin')
  layTatCaGianVien(){
    return this.giangVienService.layTatCaGiangVien();
  }

  @Get('mon-hoc/:idMonHoc/admin')
  layGiangVienTheoMonHoc(@Param('idMonHoc') idMonHoc: string){
    return this.giangVienService.layTatCaGiangVienTheoMonHoc(+idMonHoc);
  }

}

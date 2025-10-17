import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseIntPipe } from '@nestjs/common';
import { BaiLamSinhVienService } from './bai-lam-sinh-vien.service';
import { CreateBaiLamSinhVienDto } from './dto/create-bai-lam-sinh-vien.dto';
import { UpdateBaiLamSinhVienDto } from './dto/update-bai-lam-sinh-vien.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/common/decorations/roles.decorator';
import { Role } from 'src/common/enum/role.enum';
import { UpdateChiTietCauHoiDto } from './dto/update-chi-tiet-cau-hoi.dto';

@Controller('bai-lam-sinh-vien')
export class BaiLamSinhVienController {
  constructor(private readonly baiLamSinhVienService: BaiLamSinhVienService) {}

  //lấy tát cả bài làm sinh viên có trong đề
  @UseGuards(JwtAuthGuard)
  @Get(':idDeThi')
  findAll(@Param('idDeThi', ParseIntPipe) idDeThi: number, @Req() req) {
    return this.baiLamSinhVienService.layBaiLamSinhVien(idDeThi, req.user.id);
  }

  
  //tạo bài làm cho sinh viên
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Req() req, @Body() createBaiLamSinhVienDto: CreateBaiLamSinhVienDto) {
    return this.baiLamSinhVienService.sinhVienLamBai(createBaiLamSinhVienDto, req.user.id);
  }
  // sinh viên trả lời đáp án
  @UseGuards(JwtAuthGuard)
  @Patch('/chi-tiet-bai-lam/:idBaiKiemTra')
  update(@Param('idBaiKiemTra',ParseIntPipe) idBaiKiemTra: number, @Body() danhSachChiTiet: UpdateChiTietCauHoiDto[]) {
    return this.baiLamSinhVienService.luuTamDapAn(idBaiKiemTra, danhSachChiTiet);
  }
  //nộp bài
  @UseGuards(JwtAuthGuard)
  @Post('/nop-bai/:idBaiLamSinhVien')
  nopBai(@Param('idBaiLamSinhVien',ParseIntPipe) idBaiLamSinhVien: number) {
    return this.baiLamSinhVienService.nopbai(idBaiLamSinhVien);
  }

  // xem lại bài làm
  @UseGuards(JwtAuthGuard)
  @Get('/xem-lai/:idBaiLamSinhVien')
  xemLaiBaiLam(@Param('idBaiLamSinhVien',ParseIntPipe) idBaiLamSinhVien: number, @Req() req) {
    return this.baiLamSinhVienService.xemLaiBaiLam(idBaiLamSinhVien);
  }
  //tiếp tục làm bài
  @UseGuards(JwtAuthGuard)
  @Get('/tiep-tuc-lam-bai/:idBaiLamSinhVien')
  tiepTucLamBai(@Param('idBaiLamSinhVien', ParseIntPipe) idBaiLamSinhVien: number) {
    return this.baiLamSinhVienService.tiepTucLamBai(idBaiLamSinhVien);
  }
 



}

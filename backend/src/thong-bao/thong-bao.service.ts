import { Injectable } from '@nestjs/common';
import { CreateThongBaoDto } from './dto/create-thong-bao.dto';
import { UpdateThongBaoDto } from './dto/update-thong-bao.dto';

@Injectable()
export class ThongBaoService {
  create(createThongBaoDto: CreateThongBaoDto) {
    return 'This action adds a new thongBao';
  }

  findAll() {
    return `This action returns all thongBao`;
  }

  findOne(id: number) {
    return `This action returns a #${id} thongBao`;
  }

  update(id: number, updateThongBaoDto: UpdateThongBaoDto) {
    return `This action updates a #${id} thongBao`;
  }

  remove(id: number) {
    return `This action removes a #${id} thongBao`;
  }
}

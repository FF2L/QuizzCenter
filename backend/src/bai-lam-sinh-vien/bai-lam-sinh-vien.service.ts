import { Injectable } from '@nestjs/common';
import { CreateBaiLamSinhVienDto } from './dto/create-bai-lam-sinh-vien.dto';
import { UpdateBaiLamSinhVienDto } from './dto/update-bai-lam-sinh-vien.dto';

@Injectable()
export class BaiLamSinhVienService {
  create(createBaiLamSinhVienDto: CreateBaiLamSinhVienDto) {
    return 'This action adds a new baiLamSinhVien';
  }

  findAll() {
    return `This action returns all baiLamSinhVien`;
  }

  findOne(id: number) {
    return `This action returns a #${id} baiLamSinhVien`;
  }

  update(id: number, updateBaiLamSinhVienDto: UpdateBaiLamSinhVienDto) {
    return `This action updates a #${id} baiLamSinhVien`;
  }

  remove(id: number) {
    return `This action removes a #${id} baiLamSinhVien`;
  }
}

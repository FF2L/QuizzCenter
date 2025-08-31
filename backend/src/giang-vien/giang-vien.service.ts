import { Injectable } from '@nestjs/common';
import { CreateGiangVienDto } from './dto/create-giang-vien.dto';
import { UpdateGiangVienDto } from './dto/update-giang-vien.dto';

@Injectable()
export class GiangVienService {
  create(createGiangVienDto: CreateGiangVienDto) {
    return 'This action adds a new giangVien';
  }

  findAll() {
    return `This action returns all giangVien`;
  }

  findOne(id: number) {
    return `This action returns a #${id} giangVien`;
  }

  update(id: number, updateGiangVienDto: UpdateGiangVienDto) {
    return `This action updates a #${id} giangVien`;
  }

  remove(id: number) {
    return `This action removes a #${id} giangVien`;
  }
}

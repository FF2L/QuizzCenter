import { Injectable } from '@nestjs/common';
import { CreateSinhVienDto } from './dto/create-sinh-vien.dto';
import { UpdateSinhVienDto } from './dto/update-sinh-vien.dto';

@Injectable()
export class SinhVienService {
  create(createSinhVienDto: CreateSinhVienDto) {
    return 'This action adds a new sinhVien';
  }

  findAll() {
    return `This action returns all sinhVien`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sinhVien`;
  }

  update(id: number, updateSinhVienDto: UpdateSinhVienDto) {
    return `This action updates a #${id} sinhVien`;
  }

  remove(id: number) {
    return `This action removes a #${id} sinhVien`;
  }
}

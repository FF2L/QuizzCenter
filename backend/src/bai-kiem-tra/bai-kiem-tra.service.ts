import { Injectable } from '@nestjs/common';
import { CreateBaiKiemTraDto } from './dto/create-bai-kiem-tra.dto';
import { UpdateBaiKiemTraDto } from './dto/update-bai-kiem-tra.dto';

@Injectable()
export class BaiKiemTraService {
  create(createBaiKiemTraDto: CreateBaiKiemTraDto) {
    return 'This action adds a new baiKiemTra';
  }

  findAll() {
    return `This action returns all baiKiemTra`;
  }

  findOne(id: number) {
    return `This action returns a #${id} baiKiemTra`;
  }

  update(id: number, updateBaiKiemTraDto: UpdateBaiKiemTraDto) {
    return `This action updates a #${id} baiKiemTra`;
  }

  remove(id: number) {
    return `This action removes a #${id} baiKiemTra`;
  }
}

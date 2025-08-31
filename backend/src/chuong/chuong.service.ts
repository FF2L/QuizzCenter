import { Injectable } from '@nestjs/common';
import { CreateChuongDto } from './dto/create-chuong.dto';
import { UpdateChuongDto } from './dto/update-chuong.dto';

@Injectable()
export class ChuongService {
  create(createChuongDto: CreateChuongDto) {
    return 'This action adds a new chuong';
  }

  findAll() {
    return `This action returns all chuong`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chuong`;
  }

  update(id: number, updateChuongDto: UpdateChuongDto) {
    return `This action updates a #${id} chuong`;
  }

  remove(id: number) {
    return `This action removes a #${id} chuong`;
  }
}

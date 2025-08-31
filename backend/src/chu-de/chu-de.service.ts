import { Injectable } from '@nestjs/common';
import { CreateChuDeDto } from './dto/create-chu-de.dto';
import { UpdateChuDeDto } from './dto/update-chu-de.dto';

@Injectable()
export class ChuDeService {
  create(createChuDeDto: CreateChuDeDto) {
    return 'This action adds a new chuDe';
  }

  findAll() {
    return `This action returns all chuDe`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chuDe`;
  }

  update(id: number, updateChuDeDto: UpdateChuDeDto) {
    return `This action updates a #${id} chuDe`;
  }

  remove(id: number) {
    return `This action removes a #${id} chuDe`;
  }
}

import { Injectable } from '@nestjs/common';
import { CreateMonHocDto } from './dto/create-mon-hoc.dto';
import { UpdateMonHocDto } from './dto/update-mon-hoc.dto';

@Injectable()
export class MonHocService {
  create(createMonHocDto: CreateMonHocDto) {
    return 'This action adds a new monHoc';
  }

  findAll() {
    return `This action returns all monHoc`;
  }

  findOne(id: number) {
    return `This action returns a #${id} monHoc`;
  }

  update(id: number, updateMonHocDto: UpdateMonHocDto) {
    return `This action updates a #${id} monHoc`;
  }

  remove(id: number) {
    return `This action removes a #${id} monHoc`;
  }
}

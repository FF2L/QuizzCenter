import { Injectable } from '@nestjs/common';
import { CreateKhoaDto } from './dto/create-khoa.dto';
import { UpdateKhoaDto } from './dto/update-khoa.dto';

@Injectable()
export class KhoaService {
  create(createKhoaDto: CreateKhoaDto) {
    return 'This action adds a new khoa';
  }

  findAll() {
    return `This action returns all khoa`;
  }

  findOne(id: number) {
    return `This action returns a #${id} khoa`;
  }

  update(id: number, updateKhoaDto: UpdateKhoaDto) {
    return `This action updates a #${id} khoa`;
  }

  remove(id: number) {
    return `This action removes a #${id} khoa`;
  }
}

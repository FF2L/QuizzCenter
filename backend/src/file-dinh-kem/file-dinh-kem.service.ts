import { Injectable } from '@nestjs/common';
import { CreateFileDinhKemDto } from './dto/create-file-dinh-kem.dto';
import { UpdateFileDinhKemDto } from './dto/update-file-dinh-kem.dto';

@Injectable()
export class FileDinhKemService {
  create(createFileDinhKemDto: CreateFileDinhKemDto) {
    return 'This action adds a new fileDinhKem';
  }

  findAll() {
    return `This action returns all fileDinhKem`;
  }

  findOne(id: number) {
    return `This action returns a #${id} fileDinhKem`;
  }

  update(id: number, updateFileDinhKemDto: UpdateFileDinhKemDto) {
    return `This action updates a #${id} fileDinhKem`;
  }

  remove(id: number) {
    return `This action removes a #${id} fileDinhKem`;
  }
}

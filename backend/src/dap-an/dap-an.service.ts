import { Injectable } from '@nestjs/common';
import { CreateDapAnDto } from './dto/create-dap-an.dto';
import { UpdateDapAnDto } from './dto/update-dap-an.dto';

@Injectable()
export class DapAnService {
  create(createDapAnDto: CreateDapAnDto) {
    return 'This action adds a new dapAn';
  }

  findAll() {
    return `This action returns all dapAn`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dapAn`;
  }

  update(id: number, updateDapAnDto: UpdateDapAnDto) {
    return `This action updates a #${id} dapAn`;
  }

  remove(id: number) {
    return `This action removes a #${id} dapAn`;
  }
}

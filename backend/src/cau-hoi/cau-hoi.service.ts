import { Injectable } from '@nestjs/common';
import { CreateCauHoiDto } from './dto/create-cau-hoi.dto';
import { UpdateCauHoiDto } from './dto/update-cau-hoi.dto';

@Injectable()
export class CauHoiService {
  create(createCauHoiDto: CreateCauHoiDto) {
    return 'This action adds a new cauHoi';
  }

  findAll() {
    return `This action returns all cauHoi`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cauHoi`;
  }

  update(id: number, updateCauHoiDto: UpdateCauHoiDto) {
    return `This action updates a #${id} cauHoi`;
  }

  remove(id: number) {
    return `This action removes a #${id} cauHoi`;
  }
}

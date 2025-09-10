import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMonHocDto } from './dto/create-mon-hoc.dto';
import { UpdateMonHocDto } from './dto/update-mon-hoc.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonHoc } from './entities/mon-hoc.entity';

@Injectable()
export class MonHocService {

  constructor(@InjectRepository(MonHoc) private monHocRepo: Repository<MonHoc> ){}

  async timMotMonHocTheoId(idMonHod: number){
    const monHoc = await this.monHocRepo.findOne({
        where: {id: idMonHod}
    })

    if (!monHoc) throw new NotFoundException('Không tìm thấy môn học')

    return monHoc
  }

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

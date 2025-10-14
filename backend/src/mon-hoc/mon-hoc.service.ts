import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMonHocDto } from './dto/create-mon-hoc.dto';
import { UpdateMonHocDto } from './dto/update-mon-hoc.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MonHoc } from './entities/mon-hoc.entity';
import { Pagination } from 'src/common/dto/pagination.dto';
import { DEFAULT_PAGE_LIMIT } from 'src/common/utiils/const.globals';

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

  async layTatCaMonHoc(pagination: Pagination) {
    return await this.monHocRepo.find({
      skip: pagination.skip, //không có biến skip thì lấy từ đầu
      take: pagination.limit ?? DEFAULT_PAGE_LIMIT // không có biến limit thì mặc định lấy 10
    });
  }

    async layTatCaMonHocV2(pagination: Pagination, userId:number) {
    const qb =  this.monHocRepo.createQueryBuilder('mh')
                .innerJoin('mh.giangVien', 'gv')
                .where('gv.idNguoiDung = :userId', {userId})
                .orderBy('mh.create_at', 'DESC')
                .skip(pagination.skip ?? 0)
                .take(pagination.limit ?? DEFAULT_PAGE_LIMIT)
    return await qb.getMany();
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

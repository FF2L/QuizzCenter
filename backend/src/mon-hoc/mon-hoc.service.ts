import { log } from 'console';
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

// ...existing code...
async layTatCaMonHocTheoKhoaCuaGiangVien(query: any, userId: number) {
  const { skip, limit, maMon, tenMon } = query;
  
  const qb = this.monHocRepo.createQueryBuilder('mh')
              .innerJoin('mh.khoa', 'khoa')
              .innerJoin('khoa.nguoiDung', 'nd')
              .where('nd.id = :userId', { userId })
              .skip(skip ?? 0)
              .take(limit ?? DEFAULT_PAGE_LIMIT)
  
  if (maMon) qb.andWhere('mh.maMonHoc LIKE :maMon', { maMon: `%${maMon}%` });
  if (tenMon) {qb.andWhere(`unaccent(mh.tenMonHoc) ILIKE unaccent(:tenMon)`,{ tenMon: `%${tenMon}%` });
}
              
  const [data, total] = await qb.getManyAndCount();
  
  return {
    data,
    total,
    currentPage: Math.floor((skip ?? 0) / (limit ?? DEFAULT_PAGE_LIMIT)) + 1,
    totalPages: Math.ceil(total / (limit ?? DEFAULT_PAGE_LIMIT))
  };
}
// ...existing code...

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

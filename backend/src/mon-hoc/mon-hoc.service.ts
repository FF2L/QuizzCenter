import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMonHocDto } from './dto/create-mon-hoc.dto';
import { UpdateMonHocDto } from './dto/update-mon-hoc.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { MonHoc } from './entities/mon-hoc.entity';
import { Pagination } from 'src/common/dto/pagination.dto';
import { DEFAULT_PAGE_LIMIT } from 'src/common/utiils/const.globals';
import { UpdatePhanCongMonHocDto } from './dto/update-phan-cong-mon-hoc';
import { GiangVien } from 'src/giang-vien/entities/giang-vien.entity';

@Injectable()
export class MonHocService {

  constructor(@InjectRepository(MonHoc) private monHocRepo: Repository<MonHoc> ,
  @InjectRepository(GiangVien) private giangVienRepo: Repository<GiangVien>
){}

  async timMotMonHocTheoId(idMonHod: number){
    const monHoc = await this.monHocRepo.findOne({
        where: {id: idMonHod}
    })

    if (!monHoc) throw new NotFoundException('Không tìm thấy môn học')

    return monHoc
  }


async layTatCaMonHocCuaGiangVien(query: any, userId: number) {
  const { skip, limit, maMon, tenMon } = query;
  
  const qb = this.monHocRepo.createQueryBuilder('mh')
              .leftJoin('mh.giangVien', 'gv')
              .leftJoin('gv.nguoiDung', 'nd')
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

//CRUD môn học Admin
  async create(createMonHocDto: CreateMonHocDto) {
    const { maMonHoc, tenMonHoc } = createMonHocDto;
    const monHocDaTrungMa =  await this.monHocRepo.findOne({
      where: { maMonHoc }
    });
    if(monHocDaTrungMa) throw new NotFoundException('Mã môn học đã tồn tại');
    return await this.monHocRepo.save({
      maMonHoc,
      tenMonHoc
    });
  }
  findOne(id: number) {
    return this.monHocRepo.findOne({
      where: { id }
    });
  }
  async update(id: number, updateMonHocDto: UpdateMonHocDto) {
    const { maMonHoc, tenMonHoc } = updateMonHocDto;
    const monHocDaTrungMa = await this.monHocRepo.findOne({
      where: { maMonHoc: maMonHoc, id : Not(id)  }
    });
    if(monHocDaTrungMa) throw new NotFoundException('Mã môn học đã tồn tại');

    const monHoc= await this.monHocRepo.update(id, {
      maMonHoc,
      tenMonHoc
    });
    return await this.monHocRepo.findOne({
      where: { id }
    });
 
  }
  async remove(id: number) {
    const res = await this.monHocRepo.softDelete(id);
    if(!res) throw new NotFoundException('Môn học không tồn tại');
    return {message: 'Xóa môn học thành công'}
  }
  async layTatCaMonHoc(query: any) {
    const { skip, limit, tenMon } = query;
    const qb = this.monHocRepo.createQueryBuilder('mh')
    if(skip){
      qb.skip(skip);
    }else{
      qb.skip(0);
    }
    if(limit){
      qb.take(limit);
    }else{
      qb.take(DEFAULT_PAGE_LIMIT)
    }
    if(tenMon){
      qb.where(`unaccent(mh.tenMonHoc) ILIKE unaccent(:tenMon)`, { tenMon: `%${tenMon}%` });
    }
    const [data, total] = await qb.getManyAndCount();
    return {data,
            total,
            currentPage: Math.floor((skip ?? 0) / (limit ?? DEFAULT_PAGE_LIMIT)) + 1,
            totalPages: Math.ceil(total / (limit ?? DEFAULT_PAGE_LIMIT))}
  }
  async phanCongChoGiangVien(dto: UpdatePhanCongMonHocDto) {
    const { idGiangVien, danhSachIdMonHoc } = dto
    try{
        const current = await this.giangVienRepo
        .createQueryBuilder()
        .relation(GiangVien, 'monHoc')
        .of(idGiangVien)
        .loadMany<MonHoc>();

        const currentIds = new Set(current.map(m => m.id));
        const newIds     = new Set(danhSachIdMonHoc);

        const toAdd    = danhSachIdMonHoc.filter(id => !currentIds.has(id));
        const toRemove = [...currentIds].filter(id => !newIds.has(id));

        //  Gỡ những cái không còn
        if (toRemove.length) {
          await this.giangVienRepo
            .createQueryBuilder()
            .relation(GiangVien, 'monHoc')
            .of(idGiangVien)
            .remove(toRemove);
        }

        // Thêm những cái mới
        if (toAdd.length) {
          await this.giangVienRepo
            .createQueryBuilder()
            .relation(GiangVien, 'monHoc')
            .of(idGiangVien)
            .add(toAdd);
        }
        return {message: 'Phân công thành công'};
    }catch(err){
      console.error(err);
      throw new NotFoundException('Phân công thất bại');
    }

  }
  async layTatCaMonHocGiangVienDaDcPhanCong(idGiangVien: number) {
    const danhSachMonHoc = await this.monHocRepo.find({
      where: {
        giangVien: {
          idNguoiDung: idGiangVien
        }
      }
    });
    return danhSachMonHoc;
  }
}

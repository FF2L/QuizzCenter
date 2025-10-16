import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLopHocPhanDto } from './dto/create-lop-hoc-phan.dto';
import { UpdateLopHocPhanDto } from './dto/update-lop-hoc-phan.dto';
import { FilterLopHocPhanQueryDto } from './dto/filte-lop-hoc-phan.dto';
import { LopHocPhan } from './entities/lop-hoc-phan.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MonHocService } from 'src/mon-hoc/mon-hoc.service';
import { GiangVienService } from 'src/giang-vien/giang-vien.service';
import { Pagination } from 'src/common/dto/pagination.dto';
import { FilterLopHocPhanSinhVienDto } from './dto/filter-lop-hoc-phan-sv.dto';
import { DEFAULT_PAGE_LIMIT } from 'src/common/utiils/const.globals';

@Injectable()
export class LopHocPhanService {

  constructor(@InjectRepository(LopHocPhan) private lopHocPhanRep: Repository<LopHocPhan>,
              private monHocService: MonHocService,
              private giangVienService: GiangVienService
){}


  create(createLopHocPhanDto: CreateLopHocPhanDto) {
    return 'This action adds a new lopHocPhan';
  }

  async layTatCaLopHocPhanTheoIdMonHocVaIdGiaoVien(idMonHoc: number, filterLopHocPHan: FilterLopHocPhanQueryDto) {
    await this.monHocService.timMotMonHocTheoId(idMonHoc)
   
    if(filterLopHocPHan.idGiangVien){
      await this.giangVienService.timGiangVienTheoId(filterLopHocPHan.idGiangVien)
      return await this.lopHocPhanRep.find({where: 
        {idGiangVien: filterLopHocPHan.idGiangVien,
           idMonHoc,
          thoiGianKetThuc: MoreThanOrEqual(new Date())}})
    } else{
      return await this.lopHocPhanRep.find({where: {idMonHoc, thoiGianKetThuc: MoreThanOrEqual(new Date())}})
    }
    
  }

  async layTatCaLopHocPhanCuaSinhVien(lhpSVDto: FilterLopHocPhanSinhVienDto, idSinhVien: number) {
    const {tenMonHoc,maMonHoc,...pageDto} = lhpSVDto
    const {skip, limit} = pageDto
    const qb = this.lopHocPhanRep
    .createQueryBuilder('lhp')
    .innerJoin('lhp.sinhVien', 'sv', 'sv.idNguoiDung = :idSinhVien', { idSinhVien })
    .leftJoin('lhp.monHoc', 'mh')
    .select([
      'lhp.id AS lhp_id',
      'lhp.tenLopHoc AS tenLHP',
      'lhp.hocKy AS hocKy',
      'lhp.thoiGianBatDau AS thoiGianBatDau',
      'lhp.thoiGianKetThuc AS thoiGianKetThuc',
      'mh.maMonHoc AS maMonHoc',
      'mh.tenMonHoc AS tenMonHoc',
    ])
    .orderBy('lhp.thoiGianKetThuc', 'ASC')
    .offset(skip ?? 0)
    .limit(limit ?? DEFAULT_PAGE_LIMIT);

  // ------ Lọc theo tên/mã môn (LIKE, không dấu, không phân biệt hoa thường) ------
  // Dùng trim để bỏ khoảng trắng 2 đầu:
  const ten = (tenMonHoc ?? '').trim();
  const ma  = (maMonHoc ?? '').trim();

  if (ten) {
    qb.andWhere(
      `unaccent(lower(mh.tenMonHoc)) LIKE unaccent(lower(:tenMonHoc))`,
      { tenMonHoc: `%${ten}%` }
    );
  }

  if (ma) {
    qb.andWhere(
      `unaccent(lower(mh.maMonHoc)) LIKE unaccent(lower(:maMonHoc))`,
      { maMonHoc: `%${ma}%` }
    );
  }
  return await qb.getRawMany();
  }



  async timMotLopHocPhanTheoId(idlopHocPHan: number){
    const lopHocPhan = await this.lopHocPhanRep.findOne({where: {id: idlopHocPHan}})
    if (!lopHocPhan) throw new NotFoundException(`Không tìm thấy lớp học phần với ${idlopHocPHan}`)
    return lopHocPhan
  
  }

  findOne(id: number) {
    return `This action returns a #${id} lopHocPhan`;
  }

  update(id: number, updateLopHocPhanDto: UpdateLopHocPhanDto) {
    return `This action updates a #${id} lopHocPhan`;
  }

  remove(id: number) {
    return `This action removes a #${id} lopHocPhan`;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLopHocPhanDto } from './dto/create-lop-hoc-phan.dto';
import { UpdateLopHocPhanDto } from './dto/update-lop-hoc-phan.dto';
import { LopHocPhan } from './entities/lop-hoc-phan.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MonHocService } from 'src/mon-hoc/mon-hoc.service';
import { GiangVienService } from 'src/giang-vien/giang-vien.service';
import { Pagination } from 'src/common/dto/pagination.dto';
import { FilterLopHocPhanSinhVienDto } from './dto/filter-lop-hoc-phan-sv.dto';
import { DEFAULT_PAGE_LIMIT } from 'src/common/utiils/const.globals';
import { SinhVienWithBaiKiemTra } from 'src/common/utiils/types.globals';
import { LoaiKiemTra } from 'src/common/enum/loaiKiemTra.enum';

@Injectable()
export class LopHocPhanService {

  constructor(@InjectRepository(LopHocPhan) private lopHocPhanRep: Repository<LopHocPhan>,
              private monHocService: MonHocService,
              private giangVienService: GiangVienService
){}



  create(createLopHocPhanDto: CreateLopHocPhanDto) {
    return 'This action adds a new lopHocPhan';
  }

  async layTatCaLopHocPhanTheoIdGiaoVien( idGiangVien: number, query: any) {
    const {giangDay, tenMonHoc, skip, limit,} = query;
    const qb = this.lopHocPhanRep
    .createQueryBuilder('lhp')
    .leftJoin('lhp.monHoc', 'mh')
    .leftJoin('lhp.giangVien', 'gv')
    .leftJoin('lhp.sinhVien', 'sv')
    .where('gv.idNguoiDung = :idGiangVien' ,{idGiangVien})
    .groupBy('lhp.id, mh.id, gv.idNguoiDung');

    const now = new Date();

    if (giangDay === 1) { // ĐAng giảng dạy
      qb.andWhere('lhp.thoiGianBatDau <= :now AND lhp.thoiGianKetThuc >= :now', { now });
    }

    if (giangDay === 2) { // Đã kết thúc
      qb.andWhere('lhp.thoiGianKetThuc < :now', { now });
    }

    if (giangDay === 3) { // Sắp dạy
      qb.andWhere('lhp.thoiGianBatDau > :now', { now });
    }

 
   
    if(tenMonHoc){
      const ten = tenMonHoc.trim();
      qb.andWhere(
        `unaccent(lower(mh.tenMonHoc)) ILIKE unaccent(lower(:tenMonHoc))`,
        { tenMonHoc: `%${ten}%` }
      );
    }

    const data = await qb.select([
      'lhp.id AS lhp_id',
      'lhp.tenLopHoc AS tenLHP',
      'lhp.hocKy AS hocKy',
      'lhp.thoiGianBatDau AS thoiGianBatDau',
      'lhp.thoiGianKetThuc AS thoiGianKetThuc',
      'mh.maMonHoc AS maMonHoc',
      'mh.tenMonHoc AS tenMonHoc',
      'COUNT(sv.idNguoiDung) AS siSo'
    ])
    .offset(skip ?? 0)
    .limit(limit ?? DEFAULT_PAGE_LIMIT)
    .orderBy('lhp.thoiGianKetThuc', 'ASC')
    .getRawMany();
    
    const total = await qb.getCount();

    return {data , total, currentPage: Math.floor((skip ?? 0) / (limit ?? DEFAULT_PAGE_LIMIT)) + 1, totalPages: Math.ceil(total / (limit ?? DEFAULT_PAGE_LIMIT))}
  }

async layBangDiemChiTietTheoLop(idLopHocPhan: number): Promise<SinhVienWithBaiKiemTra[]> {
  const qb = this.lopHocPhanRep
    .createQueryBuilder('lhp')
    .leftJoin('lhp.sinhVien', 'sv')
    .leftJoin('sv.nguoiDung', 'nd')
    .leftJoin('sv.baiLamSInhVien', 'blsv')
    .leftJoin('blsv.baiKiemTra','bkt',
    `bkt.thoiGianKetThuc <= :now 
    AND bkt.loaiKiemTra = :loaiKiemTra
  `,{ now: new Date(), loaiKiemTra: LoaiKiemTra.BaiKiemTra }
)
    .where('lhp.id = :idLopHocPhan', { idLopHocPhan })

  const rows = await qb
    .select([
      'nd.id               AS nd_id',
      'nd.maNguoiDung      AS maSinhVien',
      'nd.anhDaiDien       AS anhDaiDienSinhVien',
      'nd.hoTen            AS hoTenSinhVien',
      'nd.email            AS emailSinhVien',

      'bkt.id              AS bkt_id',
      'bkt.tenBaiKiemTra   AS tenBaiKiemTra',
      'blsv.tongDiem       AS tongDiem',
    ])
    .getRawMany();

  // Gom nhóm theo sinh viên → danh sách bài kiểm tra
  const map = new Map<string, SinhVienWithBaiKiemTra>();

  for (const r of rows) {
    if (!map.has(r.nd_id)) {
      map.set(r.nd_id, {
        maSinhVien: r.masinhvien,
        anhDaiDienSinhVien: r.anhdaiDiensinhvien ?? null,
        hoTenSinhVien: r.hotensinhvien,
        emailSinhVien: r.emailsinhvien,
        danhSachBaiKiemTra: [],
      });
    }
    const sv = map.get(r.nd_id)!;

    // Nếu lớp chưa có bài kiểm tra, bkt_id sẽ null → không push item
    if (r.bkt_id) {
      sv.danhSachBaiKiemTra.push({
        idBaiKiemTra: r.bkt_id,
        tenBaiKiemTra: r.tenbaikiemtra,
        tongDiem: r.tongdiem ?? 0,
      });
    }
  }

  // Trường hợp lớp chưa tạo BKT nào: vẫn trả SV với danhSachBaiKiemTra=[]
  return Array.from(map.values());
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

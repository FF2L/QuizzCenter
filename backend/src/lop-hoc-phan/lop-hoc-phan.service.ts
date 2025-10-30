import { Injectable, NotFoundException, Query } from '@nestjs/common';
import { CreateLopHocPhanDto } from './dto/create-lop-hoc-phan.dto';
import { UpdateLopHocPhanDto } from './dto/update-lop-hoc-phan.dto';
import { LopHocPhan } from './entities/lop-hoc-phan.entity';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MonHocService } from 'src/mon-hoc/mon-hoc.service';
import { GiangVienService } from 'src/giang-vien/giang-vien.service';
import { Pagination } from 'src/common/dto/pagination.dto';
import { FilterLopHocPhanSinhVienDto } from './dto/filter-lop-hoc-phan-sv.dto';
import { DEFAULT_PAGE_LIMIT } from 'src/common/utiils/const.globals';
import { SinhVienWithBaiKiemTra } from 'src/common/utiils/types.globals';
import { LoaiKiemTra } from 'src/common/enum/loaiKiemTra.enum';
import { BaiKiemTra } from 'src/bai-kiem-tra/entities/bai-kiem-tra.entity';
import { BaiLamSinhVien } from 'src/bai-lam-sinh-vien/entities/bai-lam-sinh-vien.entity';
import { SinhVien } from 'src/sinh-vien/entities/sinh-vien.entity';
import { NguoiDung } from 'src/nguoi-dung/entities/nguoi-dung.entity';
import * as ExcelJS from 'exceljs';

@Injectable()
export class LopHocPhanService {

  constructor(@InjectRepository(LopHocPhan) private lopHocPhanRep: Repository<LopHocPhan>,
              private monHocService: MonHocService,
              private giangVienService: GiangVienService,
              @InjectRepository(BaiKiemTra) private readonly bktRepo: Repository<BaiKiemTra>,
              @InjectRepository(BaiLamSinhVien) private readonly blsvRepo: Repository<BaiLamSinhVien>,
              @InjectRepository(SinhVien) private readonly svRepo: Repository<SinhVien>,
              @InjectRepository(NguoiDung) private readonly ndRepo: Repository<NguoiDung>,
){}

  //CRUD Lớp học phần Admin

  async layTatCaLopHocPhanAdmin(query: any) {
    const {tenLopHoc, skip, limit,} = query;
    const qb = this.lopHocPhanRep
    .createQueryBuilder('lhp')
    .leftJoin('lhp.monHoc', 'mh')
    .skip(skip ?? 0)
    .take(limit ?? DEFAULT_PAGE_LIMIT);

    if(tenLopHoc){
      const ten = tenLopHoc.trim();
      qb.andWhere(
        `unaccent(lower(mh.tenLopHoc)) ILIKE unaccent(lower(:tenMonHoc))`,
        { tenLopHoc: `%${ten}%` }
      );
    }

    const [data, total] = await qb.getManyAndCount();

    return { data,
            total,
            currentPage: Math.floor((skip ?? 0) / (limit ?? DEFAULT_PAGE_LIMIT)) + 1,
            totalPages: Math.ceil(total / (limit ?? DEFAULT_PAGE_LIMIT)) };
  }

  async taoLopHocPhan(createLopHocPhanDto: CreateLopHocPhanDto) {
    const {tenLopHoc, hocKy, thoiGianBatDau, thoiGianKetThuc, idMonHoc, idGiangVien } = createLopHocPhanDto;
    

    const lopHocSave = await this.lopHocPhanRep.save({
      tenLopHoc,
      hocKy,
      thoiGianBatDau,
      thoiGianKetThuc,
      idMonHoc,
      idGiangVien,
    });

    const maLopHoc = `LHP${lopHocSave.id.toString().padStart(6, '0')}`;
    
    lopHocSave.maLopHoc = maLopHoc;
    return await this.lopHocPhanRep.save(lopHocSave);
  }

  async capNhatLopHocPhan(id: number, updateLopHocPhanDto: UpdateLopHocPhanDto) {
    const lopHocPhan = await this.lopHocPhanRep.findOne({where: {id}});

    if (!lopHocPhan) throw new NotFoundException(`Không tìm thấy lớp học phần với id ${id}`); 

    const { tenLopHoc, hocKy, thoiGianBatDau, thoiGianKetThuc, idMonHoc, idGiangVien } = updateLopHocPhanDto;

    lopHocPhan.tenLopHoc = tenLopHoc;
    lopHocPhan.hocKy = hocKy;
    lopHocPhan.thoiGianBatDau = thoiGianBatDau;
    lopHocPhan.thoiGianKetThuc = thoiGianKetThuc;
    lopHocPhan.idMonHoc = idMonHoc;
    lopHocPhan.idGiangVien = idGiangVien;

    return await this.lopHocPhanRep.save(lopHocPhan);
  }

  async xoaLopHocPhan(id: number) {
    const lopHocPhan = await this.lopHocPhanRep.findOne({ where: { id } });
    if (!lopHocPhan) throw new NotFoundException(`Không tìm thấy lớp học phần với id ${id}`);
    await this.lopHocPhanRep.softDelete(id);
  }

  async layTatCaSinhVienCuaLopHocPhan(id: number, query: any) {
    const {tenSinhVien, skip, limit,} = query;
    const qb = this.lopHocPhanRep
    .createQueryBuilder('lhp')
    .leftJoin('lhp.sinhVien', 'sv')
    .leftJoin('sv.nguoiDung', 'nd')
    .where('lhp.id = :id', { id });

    const total = await qb.getCount();
    
    if(tenSinhVien){
      const ten = tenSinhVien.trim();
      qb.andWhere(
        `unaccent(lower(nd.hoTen)) ILIKE unaccent(lower(:tenSinhVien))`,
        { tenSinhVien: `%${ten}%` }
      );
    }
    const data = await qb.select([
      'nd.id AS nd_id',
      'nd.maNguoiDung AS maSinhVien',
      'nd.hoTen AS hoTenSinhVien',
      'nd.gioiTinh AS gioiTinhSinhVien',
      'nd.email AS emailSinhVien',
      'nd.anhDaiDien AS anhDaiDienSinhVien',
    ])
    .offset(skip ?? 0)
    .limit(limit ?? DEFAULT_PAGE_LIMIT)
    .getRawMany();

    return {data ,
       total, currentPage: Math.floor((skip ?? 0) / (limit ?? DEFAULT_PAGE_LIMIT)) + 1, totalPages: Math.ceil(total / (limit ?? DEFAULT_PAGE_LIMIT))}
    
    
  }

  async themSinhVienVaoLopHocPhan(idLopHocPhan:number, maSinhVien: string) {
    try {
       const sinhVien = await this.lopHocPhanRep.createQueryBuilder('lhp')
      .leftJoin('lhp.sinhVien', 'sv')
      .leftJoin('sv.nguoiDung', 'nd')
      .where('nd.maNguoiDung = :maSinhVien', { maSinhVien })
      .getOne();
      if(sinhVien) throw new NotFoundException('Sinh viên đã được thêm vào lớp học phần');

      const nguoiDung = await this.ndRepo.findOne({
        where: { maNguoiDung: maSinhVien }
      });
      if(!nguoiDung) throw new NotFoundException('Không tìm thấy sinh viên với mã sinh viên đã cho');

      await this.lopHocPhanRep.createQueryBuilder()
      .relation(LopHocPhan, 'sinhVien')
      .of(idLopHocPhan)
      .add(nguoiDung.id);
      return { message: 'Thêm sinh viên vào lớp học phần thành công' };
      
    } catch (error) {
      console.error(error);
      throw new NotFoundException('Lỗi khi thêm sinh viên vào lớp học phần');
    }
  }
  async xoaSinhVienKhoiLopHocPhan(idLopHocPhan:number, maSinhVien: string) {
    try {
        const nguoiDung = await this.ndRepo.findOne({
        where: { maNguoiDung: maSinhVien }
        });
        if(!nguoiDung) throw new NotFoundException('Không tìm thấy sinh viên với mã sinh viên đã cho');
        await this.lopHocPhanRep.createQueryBuilder()
        .relation(LopHocPhan, 'sinhVien')
        .of(idLopHocPhan)
        .remove(nguoiDung.id);
        return { message: 'Xóa sinh viên khỏi lớp học phần thành công' };
      
    } catch (error) {
      console.error(error);
      throw new NotFoundException('Lỗi khi xóa sinh viên khỏi lớp học phần');
    }
  }

  //End CRUD Lớp học phần Admin




async layTatCaLopHocPhanTheoIdGiaoVien( idGiangVien: number, query: any) {
    const {giangDay, tenMonHoc, skip, limit,} = query;
    const qb = this.lopHocPhanRep
    .createQueryBuilder('lhp')
    .leftJoin('lhp.giangVien', 'gv', 'gv.idNguoiDung = :idGiangVien' ,{idGiangVien})
    .leftJoin('lhp.sinhVien', 'sv')
    .leftJoin('lhp.monHoc', 'mh')
    .groupBy('lhp.id, gv.idNguoiDung, mh.id');

    const total = await qb.getCount();

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
    // console.log(qb.getSql())
    

    return {data , total, currentPage: Math.floor((skip ?? 0) / (limit ?? DEFAULT_PAGE_LIMIT)) + 1, totalPages: Math.ceil(total / (limit ?? DEFAULT_PAGE_LIMIT))}
  }

 async layTatCaLopHocPhanDangDayCuaGiaoVien(idGiangVien: number) {
    const now = new Date();
    const lopHocPhan = await this.lopHocPhanRep
    .createQueryBuilder('lhp')
    .leftJoin('lhp.giangVien', 'gv', 'gv.idNguoiDung = :idGiangVien' ,{idGiangVien})
    .leftJoin('lhp.monHoc', 'mh')
    .where('lhp.thoiGianBatDau <= :now AND lhp.thoiGianKetThuc >= :now', { now })
    .select([
      'lhp.id AS lhp_id',
      'lhp.tenLopHoc AS tenLHP',
      'lhp.hocKy AS hocKy',
      'mh.maMonHoc AS maMonHoc',
      'mh.tenMonHoc AS tenMonHoc',
    ])
    .orderBy('lhp.thoiGianKetThuc', 'ASC')
    .getRawMany();

    return lopHocPhan;
  }

async layBangDiemChiTietTheoLop(idLopHocPhan: number, query: any) {
  const {skip, limit, tenSinhVien} = query;
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

  const { count } = await qb.clone()
  .select('COUNT(DISTINCT nd.id)')
  .getRawOne();

  const total = Number(count) || 0
  if (tenSinhVien) {
    const ten = tenSinhVien.trim();
    qb.andWhere(
      `unaccent(lower(nd.hoTen)) ILIKE unaccent(lower(:tenSinhVien))`,
      { tenSinhVien: `%${ten}%` }
    );
  }

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
    .offset(skip ?? 0)
    .limit(limit ?? DEFAULT_PAGE_LIMIT)
    .getRawMany();

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

    if (r.bkt_id) {
      sv.danhSachBaiKiemTra.push({
        idBaiKiemTra: r.bkt_id,
        tenBaiKiemTra: r.tenbaikiemtra,
        tongDiem: r.tongdiem ?? 0,
      });
    }
  }

  const data = Array.from(map.values());

  return { data, total, currentPage: Math.floor((skip ?? 0) / (limit ?? DEFAULT_PAGE_LIMIT)) + 1, totalPages: Math.ceil(total / (limit ?? DEFAULT_PAGE_LIMIT)) };
}

async layDanhSachBaiKiemTra(idLopHocPhan: number) {
    const danhSachBaiKiemTra = await this.bktRepo
    .createQueryBuilder('bkt')
    .where('bkt.idLopHocPhan = :idLopHocPhan', { idLopHocPhan })
    .andWhere('bkt.loaiKiemTra = :loaiKiemTra', { loaiKiemTra: LoaiKiemTra.BaiKiemTra })
    .andWhere('bkt.thoiGianKetThuc <= :now', { now: new Date() })
    .select([
      'bkt.id AS bkt_id',
      'bkt.tenBaiKiemTra AS tenBaiKiemTra',
    ])
    .getRawMany();
    return danhSachBaiKiemTra;
}

async exportBangDiemExcel(idLopHocPhan: number): Promise<Buffer> {
    const now = new Date();

    const svRows = await this.lopHocPhanRep
      .createQueryBuilder('lhp')
      .leftJoin('lhp.sinhVien', 'sv')
      .leftJoin('sv.nguoiDung', 'nd')
      .where('lhp.id = :id', { id: idLopHocPhan })
      .select([
        'sv.idNguoiDung AS "svId"',
        'nd.maNguoiDung AS "maNguoiDung"',
        'nd.hoTen AS "hoTen"',
        'nd.email AS "email"',
      ])
      .orderBy('nd.maNguoiDung', 'ASC')
      .getRawMany<{
        svId: number;
        maNguoiDung: string;
        hoTen: string;
        email: string;
      }>();

    const bktRows = await this.bktRepo
      .createQueryBuilder('bkt')
      .where('bkt.idLopHocPhan = :id', { id: idLopHocPhan })
      .andWhere('bkt.loaiKiemTra = :loai', { loai: LoaiKiemTra.BaiKiemTra })
      .andWhere('bkt.thoiGianKetThuc <= :now', { now })
      .select([
        'bkt.id AS "bktId"',
        'bkt.tenBaiKiemTra AS "tenBaiKiemTra"',
        'bkt.thoiGianKetThuc AS "thoiGianKetThuc"',
      ])
      .orderBy('bkt.thoiGianKetThuc', 'ASC') 
      .getRawMany<{
        bktId: number;
        tenBaiKiemTra: string;
        thoiGianKetThuc: Date;
      }>();

    const bktIds = bktRows.map(r => r.bktId);

    let diemMap = new Map<string, number | null>();
    if (bktIds.length > 0 && svRows.length > 0) {
      const blRows = await this.blsvRepo
        .createQueryBuilder('bl')
        .where('bl.idBaiKiemTra IN (:...bktIds)', { bktIds })
        .andWhere('bl.idSinhVien IN (:...svIds)', { svIds: svRows.map(s => s.svId) })
        .select([
          'bl.idSinhVien AS "svId"',
          'bl.idBaiKiemTra AS "bktId"',
          'bl.tongDiem AS "tongDiem"',
        ])
        .getRawMany<{ svId: number; bktId: number; tongDiem: number | 0 }>();

      diemMap = new Map(
        blRows.map(r => [`${r.svId}_${r.bktId}`, r.tongDiem]),
      );
    }

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Bang diem');

      ws.columns = [
      { header: 'Mã người dùng', key: 'maNguoiDung', width: 18 },
      { header: 'Họ tên', key: 'hoTen', width: 28 },
      { header: 'Email', key: 'email', width: 28 },

      ...bktRows.map((bkt, idx) => ({
        header: bkt.tenBaiKiemTra || `BKT ${idx + 1}`,
        key: `bkt_${bkt.bktId}`,
        width: 14,
      })),
    ];


    ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];


    for (const sv of svRows) {
      const rowData: Record<string, any> = {
        maNguoiDung: sv.maNguoiDung,
        hoTen: sv.hoTen,
        email: sv.email,
      };

      for (const bkt of bktRows) {
        const key = `bkt_${bkt.bktId}`;
        const mapKey = `${sv.svId}_${bkt.bktId}`;
        rowData[key] = diemMap.get(mapKey) ?? 0; // chưa làm => 0
      }

      ws.addRow(rowData);
    }

    ws.getRow(1).font = { bold: true };
    if (bktRows.length > 0) {
      const startCol = 3 + 1; // sau 3 cột cố định
      for (let c = startCol; c <= 3 + bktRows.length; c++) {
        ws.getColumn(c).alignment = { horizontal: 'center' };
        ws.getColumn(c).numFmt = '0.0#'; 
      }
    }

    // 7) Xuất buffer
    const buffer = await wb.xlsx.writeBuffer();
    return Buffer.from(buffer);
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
    const total =  await qb.getCount();


  const ten = (tenMonHoc ?? '').trim();
  const ma  = (maMonHoc ?? '').trim();

  if (ten) {
    qb.andWhere(
      `unaccent(lower(mh.tenMonHoc)) ILIKE unaccent(lower(:tenMonHoc))`,
      { tenMonHoc: `%${ten}%` }
    );
  }

  if (ma) {
    qb.andWhere(
      `unaccent(lower(mh.maMonHoc)) ILIKE unaccent(lower(:maMonHoc))`,
      { maMonHoc: `%${ma}%` }
    );
  }
  const data = await qb
    .orderBy('lhp.thoiGianKetThuc', 'ASC')
    .offset(skip ?? 0)
    .limit(limit ?? DEFAULT_PAGE_LIMIT)
    .getRawMany();
    return {data , total, currentPage: Math.floor((skip ?? 0) / (limit ?? DEFAULT_PAGE_LIMIT)) + 1, totalPages: Math.ceil(total / (limit ?? DEFAULT_PAGE_LIMIT))};
  }


  async timMotLopHocPhanTheoId(idlopHocPHan: number){
    const lopHocPhan = await this.lopHocPhanRep.findOne({where: {id: idlopHocPHan}})
    if (!lopHocPhan) throw new NotFoundException(`Không tìm thấy lớp học phần với ${idlopHocPHan}`)
    return lopHocPhan
  
  }

}

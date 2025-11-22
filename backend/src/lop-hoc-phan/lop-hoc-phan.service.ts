import { BadRequestException, Injectable, NotFoundException, Query } from '@nestjs/common';
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
import * as XLSX from 'xlsx';

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
    .leftJoin('lhp.giangVien', 'gv')
    .leftJoin('gv.nguoiDung', 'nd')

    const total = await qb.getCount();

    if(tenLopHoc){
      qb.andWhere(
        `unaccent(unaccent(lhp.tenLopHoc)) ILIKE unaccent(:tenLopHoc)`,
        { tenLopHoc: `%${tenLopHoc}%` }
      );
    }

    const data = await qb.select([
      'lhp.id AS lhp_id',
      'lhp.maLopHoc AS maLHP',
      'lhp.tenLopHoc AS tenLHP',
      'lhp.hocKy AS hocKy',
      'lhp.thoiGianBatDau AS thoiGianBatDau',
      'lhp.thoiGianKetThuc AS thoiGianKetThuc',
      'mh.tenMonHoc AS tenMonHoc',
      'mh.id AS mh_id',
      'nd.hoTen AS tenGiangVien',
      'nd.id AS nd_id',
    ])
    .skip(skip ?? 0)
    .take(limit ?? DEFAULT_PAGE_LIMIT)
    .orderBy('lhp.maLopHoc', 'DESC')
    .getRawMany();

    return { data,
            total,
            currentPage: Math.floor((skip ?? 0) / (limit ?? DEFAULT_PAGE_LIMIT)) + 1,
            totalPages: Math.ceil(total / (limit ?? DEFAULT_PAGE_LIMIT)) };
  }

  async taoLopHocPhan(createLopHocPhanDto: CreateLopHocPhanDto) {
    const {tenLopHoc, hocKy, thoiGianBatDau, thoiGianKetThuc, idMonHoc, idGiangVien } = createLopHocPhanDto;
    

    const lopHocSave = await this.lopHocPhanRep.save({
      tenLopHoc: tenLopHoc.trim(),
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
    await this.lopHocPhanRep.delete(id);
  }

  async layTatCaSinhVienCuaLopHocPhan(id: number, query: any) {
    const {tenSinhVien, skip, limit,} = query;
    const qb = this.lopHocPhanRep
    .createQueryBuilder('lhp')
    .innerJoin('lhp.sinhVien', 'sv')
    .innerJoin('sv.nguoiDung', 'nd')
    .where('lhp.id = :id', { id });

    const totalQb = this.ndRepo.createQueryBuilder('nd')
    .innerJoin('nd.sinhVien', 'sv')
    .innerJoin('sv.lopHocPhan', 'lhp')
    .where('lhp.id = :id', { id });

    const total = await totalQb.getCount();
    
    if(tenSinhVien){
      qb.andWhere(
        `unaccent(nd.hoTen) ILIKE unaccent(:tenSinhVien)`,
        { tenSinhVien: `%${tenSinhVien}%` }
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
    console.log(data)

    return {data ,
       total, currentPage: Math.floor((skip ?? 0) / (limit ?? DEFAULT_PAGE_LIMIT)) + 1, totalPages: Math.ceil(total / (limit ?? DEFAULT_PAGE_LIMIT))}
    
    
  }

  async themSinhVienVaoLopHocPhan(idLopHocPhan:number, maSinhVien: string) {
    try {
      const nguoiDung = await this.ndRepo.findOne({
        where: { maNguoiDung: maSinhVien }
      });
      if(!nguoiDung) throw new NotFoundException('Không tìm thấy sinh viên với mã sinh viên đã cho');

      const sinhVien = await this.lopHocPhanRep.createQueryBuilder('lhp')
        .leftJoin('lhp.sinhVien', 'sv')
        .leftJoin('sv.nguoiDung', 'nd')
        .where('nd.maNguoiDung = :maSinhVien', { maSinhVien })
        .andWhere('lhp.id = :idLopHocPhan', { idLopHocPhan })
       .getOne();
      if(sinhVien) throw new BadRequestException('Sinh viên đã được thêm vào lớp học phần');

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

  async tenLopHocPhanById(idLopHocPhan: number) {
    const lopHocPhan = await this.lopHocPhanRep.findOne({ where: { id: idLopHocPhan } });
    if (!lopHocPhan) throw new NotFoundException(`Không tìm thấy lớp học phần với id ${idLopHocPhan}`);
    return lopHocPhan.tenLopHoc;
  }


  async exportDanhSachSinhVienExcel(idLopHocPhan: number): Promise<Buffer> {
    const dsSinhVien = await this.layTatCaSinhVienCuaLopHocPhan(idLopHocPhan, {});

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Danh sach sinh vien');
    
    ws.columns = [
      { header: 'Mã sinh viên', key: 'maSinhVien', width: 18 },
      { header: 'Họ tên', key: 'hoTenSinhVien', width: 28 },
      { header: 'Giới tính', key: 'gioiTinhSinhVien', width: 12 },
      { header: 'Email', key: 'emailSinhVien', width: 28 },
    ];

    ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

    for (const sv of dsSinhVien.data) {
      const rowData: Record<string, any> = {
        maSinhVien: sv.masinhvien,
        hoTenSinhVien: sv.hotensinhvien,
        gioiTinhSinhVien: sv.gioitinhsinhvien,
        emailSinhVien: sv.emailsinhvien,
      };
      ws.addRow(rowData);
    }

    const buffer = await wb.xlsx.writeBuffer(); 
    return Buffer.from(buffer);
  }

  async uploadFileDanhSachSinhVien(id:number, file: Express.Multer.File) {
    if(!file){
      throw new BadRequestException('File không hợp lệ');
    }

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const data = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    const danhSachSinhVien = data.map((row: any,index: number) => {
     return {
       rowIndex: index + 2, 
       sinhVien: {
        maNguoiDung: String(row['Mã sinh viên']).trim() ,
        hoTen: String(row['Họ và tên']).trim(),
        email: String(row['Email']).trim(),
       }
     }
    })

    let thanhCong: number = 0;
    const thatBai: { row: number; message: string }[] = [];

    for (const item of danhSachSinhVien) {
      const { rowIndex, sinhVien } = item;
      try {
        await this.themSinhVienVaoLopHocPhan(id, sinhVien.maNguoiDung); 
        thanhCong++;

      } catch (error) {
        thatBai.push({ row: rowIndex, message: error.message });
      }
    }
    return { thanhCong, thatBai };
  }


  //End CRUD Lớp học phần Admin




async layTatCaLopHocPhanTheoIdGiaoVien( idGiangVien: number, query: any) {
    const {giangDay, tenMonHoc, skip, limit,} = query;
    const qb = this.lopHocPhanRep
    .createQueryBuilder('lhp')
    .innerJoin('lhp.giangVien', 'gv', 'gv.idNguoiDung = :idGiangVien' ,{idGiangVien})
    .leftJoin('lhp.sinhVien', 'sv')
    .leftJoin('lhp.monHoc', 'mh')
    .groupBy('lhp.id, gv.idNguoiDung, mh.id');

    const total = await qb.getCount();

    const now = new Date();
    console.log('giangDay', giangDay)

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
      'mh.id AS mh_id',
      'mh.maMonHoc AS maMonHoc',
      'mh.tenMonHoc AS tenMonHoc',
      'COUNT(sv.idNguoiDung) AS siSo'
    ])
    // .offset(skip ?? 0)
    // .limit(limit ?? DEFAULT_PAGE_LIMIT)
    .orderBy('lhp.thoiGianKetThuc', 'ASC')
    .getRawMany();
    // console.log(qb.getSql())
    console.log(data)
    

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

async layBangDiemChiTietTheoLopVaBaiKiemTra(idLopHocPhan: number, idBaiKiemTra: number, query: any) {
  const { tenSinhVien } = query;
  console.log(idBaiKiemTra, idLopHocPhan, tenSinhVien);

  // 1. Lấy danh sách sinh viên (raw rows) — giữ nguyên alias/keys bạn muốn
  const qbSinhVien = this.lopHocPhanRep.createQueryBuilder('lhp')
    .leftJoin('lhp.sinhVien', 'sv')
    .leftJoin('sv.nguoiDung', 'nd')
    .where('lhp.id = :idLopHocPhan', { idLopHocPhan });

  if (tenSinhVien) {
    const ten = tenSinhVien.trim();
    qbSinhVien.andWhere(
      `unaccent(lower(nd.hoTen)) ILIKE unaccent(lower(:tenSinhVien))`,
      { tenSinhVien: `%${ten}%` }
    );
  }

  const dsSinhVien = await qbSinhVien.select([
    'nd.id               AS nd_id',
    'nd.maNguoiDung      AS maSinhVien',
    'nd.hoTen            AS hoTenSinhVien',
    'nd.email            AS emailSinhVien',
  ]).getRawMany();

  if (dsSinhVien.length === 0) return [];
  console.log('dsSinhVien', dsSinhVien);


  const tenBaiKiemTra = await this.bktRepo.createQueryBuilder('bkt')
    .where('bkt.id = :idBaiKiemTra', { idBaiKiemTra })
    .select(['bkt.tenBaiKiemTra AS tenBaiKiemTra'])
    .getRawOne();

  const result = await Promise.all(
   dsSinhVien.map(async sv => {
    const svId = sv.nd_id;
    console.log('svId', svId);

    const qbDiem = this.lopHocPhanRep.createQueryBuilder('lhp')
      .leftJoin('lhp.baiKiemTra', 'bkt')
      .leftJoin('bkt.baiLamSinhVien', 'blsv')
      .where('bkt.id = :idBaiKiemTra AND blsv.idSinhVien = :svId', { idBaiKiemTra, svId });

    const diemT = await qbDiem.select([
      'blsv.tongDiem AS tongDiem',
    ])
    .getRawOne();
    console.log('diemT', diemT);

    return {
      nd_id: svId,
      maSinhVien: sv.masinhvien,
      hoTenSinhVien: sv.hotensinhvien,
      emailSinhVien: sv.emailsinhvien,
      tenBaiKiemTra: tenBaiKiemTra.tenbaikiemtra,
      diem: diemT?.tongdiem ?? 0,
    };
  }))

  return result;
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

async exportBangDiemExcel(idLopHocPhan: number, idBaiKiemTra:number): Promise<Buffer> {
    const tenBaiKiemTra = await this.bktRepo.createQueryBuilder('bkt')
    .where('bkt.id = :idBaiKiemTra', { idBaiKiemTra })
    .select(['bkt.tenBaiKiemTra AS tenBaiKiemTra'])
    .getRawOne();

    const tenBKT = tenBaiKiemTra.tenbaikiemtra

    const dsXuat = await this.layBangDiemChiTietTheoLopVaBaiKiemTra(idLopHocPhan, idBaiKiemTra, {});


    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Bang diem');

      ws.columns = [
      { header: 'Mã sinh viên', key: 'maSinhVien', width: 18 },
      { header: 'Họ tên', key: 'hoTenSinhVien', width: 28 },
      { header: 'Email', key: 'emailSinhVien', width: 28 },
      { header: tenBKT, key: 'diem', width: 14 },
    ];


    ws.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];


    for (const sv of dsXuat) {
      const rowData: Record<string, any> = {
        maSinhVien: sv.maSinhVien,
        hoTenSinhVien: sv.hoTenSinhVien,
        emailSinhVien: sv.emailSinhVien,
        diem: sv.diem,
      };

      ws.addRow(rowData);
    }

    ws.getRow(1).font = { bold: true };

    // 7) Xuất buffer
    const buffer = await wb.xlsx.writeBuffer();
    return Buffer.from(buffer);
}

async thongKe(idLopHocPhan: number, idBaiKiemTra:number) {
    const dsXuat = await this.layBangDiemChiTietTheoLopVaBaiKiemTra(idLopHocPhan, idBaiKiemTra, {});
    console.log('dsXuat', dsXuat);
    const tongSoSinhVien = dsXuat.length;
    if (tongSoSinhVien === 0) {
      return {
        diemCaoNhat: 0,
        diemThapNhat: 0,
        diemTrungBinh: 0,
        soSVCoDiemLonHon5: 0,
        soSVCoDiemBeHon5: 0,
        soSVCoDiemBang10: 0,
        soSVCoDiemBHB1:0,
        soSVCoDiemBHB2:0,
        soSVCoDiemBHB3:0,
        soSVCoDiemBHB4:0,
        soSVCoDiemBHB5:0,
        soSVCoDiemBHB6:0,
        soSVCoDiemBHB7:0,
        soSVCoDiemBHB8:0,
        soSVCoDiemBHB9:0,
        soSVCoDiemBHB10:0
      };
    }
    const diemCaoNhat = Math.max(...dsXuat.map(sv => sv.diem));
    const diemThapNhat = Math.min(...dsXuat.map(sv => sv.diem));
    const diemTrungBinh = dsXuat.reduce((sum, sv) => sum + sv.diem, 0) / tongSoSinhVien;

    let soSVCoDiemLonHon5 = 0;
    let soSVCoDiemBeHon5 = 0;
    let soSVCoDiemBang10 = 0;
    const soSVCoDiemBHB: Record<number, number> = {};

    for (let i = 1; i <= 10; i++) {
      soSVCoDiemBHB[i] = 0;
    }

    for (const sv of dsXuat) {
      if (sv.diem >= 5) soSVCoDiemLonHon5++;
      if (sv.diem < 5) soSVCoDiemBeHon5++;
      if (sv.diem === 10) soSVCoDiemBang10++;

      let diemBHB = Math.ceil(sv.diem);
      if (diemBHB === 0) diemBHB = 1;
        soSVCoDiemBHB[diemBHB]++;
    }
    console.log( soSVCoDiemBHB[1]);

    return {
      diemCaoNhat,
      diemThapNhat,
      diemTrungBinh,
      soSVCoDiemLonHon5,
      soSVCoDiemBeHon5,
      soSVCoDiemBang10,
      soSVCoDiemBHB1: soSVCoDiemBHB[1],
      soSVCoDiemBHB2: soSVCoDiemBHB[2],
      soSVCoDiemBHB3: soSVCoDiemBHB[3],
      soSVCoDiemBHB4: soSVCoDiemBHB[4],
      soSVCoDiemBHB5: soSVCoDiemBHB[5],
      soSVCoDiemBHB6: soSVCoDiemBHB[6],
      soSVCoDiemBHB7: soSVCoDiemBHB[7],
      soSVCoDiemBHB8: soSVCoDiemBHB[8],
      soSVCoDiemBHB9: soSVCoDiemBHB[9],
      soSVCoDiemBHB10: soSVCoDiemBHB[10],
    };

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
    console.log({ data, total, currentPage: Math.floor((skip ?? 0) / (limit ?? DEFAULT_PAGE_LIMIT)) + 1, totalPages: Math.ceil(total / (limit ?? DEFAULT_PAGE_LIMIT)) });
    return { data, total, currentPage: Math.floor((skip ?? 0) / (limit ?? DEFAULT_PAGE_LIMIT)) + 1, totalPages: Math.ceil(total / (limit ?? DEFAULT_PAGE_LIMIT)) };

  }


  async timMotLopHocPhanTheoId(idlopHocPHan: number){
    const lopHocPhan = await this.lopHocPhanRep.findOne({where: {id: idlopHocPHan}})
    if (!lopHocPhan) throw new NotFoundException(`Không tìm thấy lớp học phần với ${idlopHocPHan}`)
    return lopHocPhan
  
  }

}

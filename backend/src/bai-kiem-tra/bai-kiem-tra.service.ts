import { BaiKiemTra } from 'src/bai-kiem-tra/entities/bai-kiem-tra.entity';
import { BadRequestException, ConsoleLogger, forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException, Delete } from '@nestjs/common';
import { CreateBaiKiemTraDto } from './dto/create-bai-kiem-tra.dto';
import { UpdateBaiKiemTraDto } from './dto/update-bai-kiem-tra.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { LopHocPhanService } from 'src/lop-hoc-phan/lop-hoc-phan.service';
import { LoaiKiemTra } from 'src/common/enum/loaiKiemTra.enum';
import { Pagination } from 'src/common/dto/pagination.dto';
import { ChiTietCauHoiBaiKiemTra } from './entities/chi-tiet-cau-hoi-bai-kiem-tra';
import { CreateChiTietBaiKiemTraDto } from './dto/create-chi-tiet-bai-kiem-tra.dto';
import { CauHoiService } from 'src/cau-hoi/cau-hoi.service';
import { FilterChiTietBaiKiemTraDto } from './dto/filter-chi-tiet-bai-kiem-tra.dto';
import { DEFAULT_PAGE_LIMIT } from 'src/common/utiils/const.globals';
import { BaiLamSinhVienService } from 'src/bai-lam-sinh-vien/bai-lam-sinh-vien.service';
import { Chuong } from 'src/chuong/entities/chuong.entity';
import { LopHocPhan } from 'src/lop-hoc-phan/entities/lop-hoc-phan.entity';
import { Console } from 'console';

@Injectable()
export class BaiKiemTraService {

  constructor(
    @InjectRepository(BaiKiemTra) private baiKiemTraRepo: Repository<BaiKiemTra>,
    @InjectRepository(ChiTietCauHoiBaiKiemTra) private chiTietCauHoiBaiKiemTraRepo: Repository<ChiTietCauHoiBaiKiemTra>,
    @InjectRepository(Chuong) private chuongRepo: Repository<Chuong>,
    private lopHocPhanService: LopHocPhanService,
    private cauHoiService: CauHoiService,
    @Inject(forwardRef(() => BaiLamSinhVienService))
    private baiLamSinhVienService: BaiLamSinhVienService,
  ) {}



  /**CRUD bài kiểm tra */
  async taoBaiKiemTra(createBaiKiemTraDto: CreateBaiKiemTraDto) {
    await this.lopHocPhanService.timMotLopHocPhanTheoId(createBaiKiemTraDto.idLopHocPhan);

    const baiKiemTra = this.baiKiemTraRepo.create({
      tenBaiKiemTra: createBaiKiemTraDto.tenBaiKiemTra,
      loaiKiemTra: createBaiKiemTraDto.loaiKiemTra,
      thoiGianBatDau: createBaiKiemTraDto.thoiGianBatDau,
      thoiGianKetThuc: createBaiKiemTraDto.thoiGianKetThuc,
      thoiGianLam: createBaiKiemTraDto.thoiGianLam,
      idLopHocPhan: createBaiKiemTraDto.idLopHocPhan,
    });

    try {
      const baiKiemTraSaved = await this.baiKiemTraRepo.save(baiKiemTra);
      return baiKiemTraSaved;
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi tạo bài kiểm tra');
    }
  }

  async timTatCaBaiKiemTraTheoIdLopHocPhan(idLopHocPhan: number, query: any) {

    await this.lopHocPhanService.timMotLopHocPhanTheoId(idLopHocPhan);
    const {loaiKiemTra, skip, limit} = query;
    const qb = this.baiKiemTraRepo.createQueryBuilder('bkt')
      .where('bkt.idLopHocPhan = :idLopHocPhan', { idLopHocPhan });
    if (loaiKiemTra) {
      qb.andWhere('bkt.loaiKiemTra = :loaiKiemTra', { loaiKiemTra });
    }
    
    const [data,total] = await qb
      .orderBy('bkt.create_at', 'DESC')
      .skip(skip ?? 0)
      .take(limit ?? DEFAULT_PAGE_LIMIT)
      .getManyAndCount();
    const currentPage = Math.floor((skip ?? 0) / (limit ?? DEFAULT_PAGE_LIMIT)) + 1;
    const totalPages = Math.ceil(total / (limit ?? DEFAULT_PAGE_LIMIT));

    return { data, total, currentPage, totalPages };
  }

  async phatHanhBaiKiemTra(idBaiKiemTra: number, phatHanh: boolean) {
    const baiKiemTra = await this.timMotBaiKiemTraTheoIdBaiKiemTra(idBaiKiemTra);
    baiKiemTra.phatHanh = phatHanh;
    try {
      return await this.baiKiemTraRepo.save(baiKiemTra);
    } catch (err) {
      throw new InternalServerErrorException('Phát hành bài kiểm tra không thành công');
    }
  }

  async timTatCaBaiKiemTraTheoIdLopHocPhanSinhVien(idLopHocPhan: number, query: any) {

    await this.lopHocPhanService.timMotLopHocPhanTheoId(idLopHocPhan);
    const {loaiKiemTra, skip, limit} = query;
    const qb = this.baiKiemTraRepo.createQueryBuilder('bkt')
      .where('bkt.idLopHocPhan = :idLopHocPhan', { idLopHocPhan })
      .andWhere('bkt.phatHanh = :phatHanh', { phatHanh: true });
    if (loaiKiemTra) {
      qb.andWhere('bkt.loaiKiemTra = :loaiKiemTra', { loaiKiemTra });
    }
    
    const [data,total] = await qb
      .orderBy('bkt.create_at', 'DESC')
      .skip(skip ?? 0)
      .take(limit ?? DEFAULT_PAGE_LIMIT)
      .getManyAndCount();
    const currentPage = Math.floor((skip ?? 0) / (limit ?? DEFAULT_PAGE_LIMIT)) + 1;
    const totalPages = Math.ceil(total / (limit ?? DEFAULT_PAGE_LIMIT));

    return { data, total, currentPage, totalPages };
  }

  async timMonHocTheoIdBaikiemTradOne(idBaiKiemTra: number) {
    const bkt = await this.baiKiemTraRepo.findOne({
      where: { id: idBaiKiemTra },
      relations: { lopHocPhan: { monHoc: true } },
      select: {
        id: true,
        lopHocPhan: {
          id: true,
          monHoc: { id: true, maMonHoc: true, tenMonHoc: true },
        },
      },
    });

    if (!bkt) return null;

    const lhp = await bkt.lopHocPhan;
    const mh = await lhp.monHoc;
    return { id: mh.id, maMonHoc: mh.maMonHoc, tenMonHoc: mh.tenMonHoc };
  }

  async timMotBaiKiemTraTheoIdBaiKiemTra(idBaiKiemTra: number) {
    const baiKiemTra = await this.baiKiemTraRepo.findOne({ where: { id: idBaiKiemTra } });
    if (!baiKiemTra) throw new NotFoundException(`Không tìm thấy bài kiểm tra ${idBaiKiemTra}`);
    return baiKiemTra;
  }

  async capNhatBaiKiemTra(idBaiKiemTra: number, updateBaiKiemTraDto: UpdateBaiKiemTraDto) {

    const baiKiemTra = await this.baiKiemTraRepo.preload({
      id: idBaiKiemTra,
      ...updateBaiKiemTraDto,
    });
    if (!baiKiemTra) {
      throw new NotFoundException(`Không tìm thấy bài kiểm tra ${idBaiKiemTra}`);
    }
    try {
      return await this.baiKiemTraRepo.save(baiKiemTra);
    } catch (err) {
      throw new InternalServerErrorException('Cập nhật bài kiểm tra không thành công');
    }
  }

  async xoaBaiKiemTRaTheoIdBaiKiemTRa(idBaiKiemTra: number) {

    try {
      return await this.baiKiemTraRepo.delete(idBaiKiemTra);
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException('Xóa bài kiểm tra không thành công');
    }
  }

  /**CRUD câu hỏi trong bài kiểm tra */
  async layTatCaCauHoiCoTrongBaiKiemTraTheoIdBaiKiemTra(idBaiKiemTra: number,query: any) {
    const { skip, limit } = query;
    await this.timMotBaiKiemTraTheoIdBaiKiemTra(idBaiKiemTra);

    try {
      const qb = this.chiTietCauHoiBaiKiemTraRepo.createQueryBuilder('ctch')
        .where('ctch.idBaiKiemTra = :idBaiKiemTra', { idBaiKiemTra })
        .innerJoin('ctch.baiKiemTra', 'bkt')
        .innerJoin('ctch.cauHoi', 'ch');

      qb.select([
        'ctch.id',
        'ctch.idBaiKiemTra',
        'ctch.idCauHoi',
        'ctch.create_at',
        'bkt.id',
        'bkt.loaiKiemTra',
        'ch.id',
        'ch.tenHienThi',
        'ch.noiDungCauHoi',
        'ch.noiDungCauHoiHTML',
        'ch.loaiCauHoi',
        'ch.doKho',
      ]);

      const skipa = Math.max(0, Number(skip ?? 0));
      const limitb = Math.max(1, Number(limit ?? DEFAULT_PAGE_LIMIT));

      const [data, total] = await qb.orderBy('ctch.create_at', 'DESC')
        .skip(skipa)
        .take(limitb)
        .getManyAndCount();
        return {data,total,
          currentPage: Math.floor((skipa ?? 0) / (limitb ?? DEFAULT_PAGE_LIMIT)) + 1,
          totalPages: Math.ceil(total / (limitb ?? DEFAULT_PAGE_LIMIT))}

    } catch (err) {
      console.error(err);
      
      throw new InternalServerErrorException('Lỗi khi lấy tất cả câu hỏi có trong bài kiểm tra');
    }
  }

  async themMangCauHoiVaoTrongBaiKiemTra(createChiTietDto: CreateChiTietBaiKiemTraDto) {
    const { idBaiKiemTra, mangIdCauHoi } = createChiTietDto;

    await this.timMotBaiKiemTraTheoIdBaiKiemTra(idBaiKiemTra);

    // Làm sạch & loại trùng trong input
    const ids = Array.from(new Set(mangIdCauHoi)).filter((x) => Number.isInteger(x));
    if (ids.length === 0) throw new BadRequestException('mangIdCauHoi không được để trống');

    // Chặn trùng đã có trong bài kiểm tra
    const existed = await this.chiTietCauHoiBaiKiemTraRepo.find({
      where: { idBaiKiemTra, idCauHoi: In(ids) },
      select: { idCauHoi: true },
    });
    const mangidCanLuu = ids.filter(id => !existed.find(e => e.idCauHoi === id));

    try {
      const danhSachChiTietBaiKiemTra = mangidCanLuu.map(id =>
        this.chiTietCauHoiBaiKiemTraRepo.create({
          idCauHoi: id,
          idBaiKiemTra: idBaiKiemTra,
        })
      );
      // Lưu chi tiết câu hỏi bài kiểm tra
      const chiTietSaved = await this.chiTietCauHoiBaiKiemTraRepo.save(danhSachChiTietBaiKiemTra);
      return chiTietSaved;
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi thêm mảng id câu hỏi vào trong bài kiểm tra');
    }
  }


  async xoaCauHoiCoTrongBaiKiemTra(idChiTietBaiKiemTra: number) {
    try {
      
      // Xóa chi tiết câu hỏi
      return await this.chiTietCauHoiBaiKiemTraRepo.delete(idChiTietBaiKiemTra);
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi xóa câu hỏi trong bài kiểm tra');
    }
  }
}
import { BaiKiemTra } from 'src/bai-kiem-tra/entities/bai-kiem-tra.entity';
import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class BaiKiemTraService {

  constructor(
    @InjectRepository(BaiKiemTra) private baiKiemTraRepo: Repository<BaiKiemTra>,
    @InjectRepository(ChiTietCauHoiBaiKiemTra) private chiTietCauHoiBaiKiemTraRepo: Repository<ChiTietCauHoiBaiKiemTra>,
    private lopHocPhanService: LopHocPhanService,
    private cauHoiService: CauHoiService,
    @Inject(forwardRef(() => BaiLamSinhVienService))
    private baiLamSinhVienService: BaiLamSinhVienService,
  ) {}

  /**CRUD bài kiểm tra */
  async taoBaiKiemTra(createBaiKiemTraDto: CreateBaiKiemTraDto) {
    await this.lopHocPhanService.timMotLopHocPhanTheoId(createBaiKiemTraDto.idLopHocPhan);
    
    if (createBaiKiemTraDto.loaiKiemTra === LoaiKiemTra.BaiKiemTra && +createBaiKiemTraDto.soLanLam > 1) {
      throw new BadRequestException('Nếu loại kiểm tra là bài kiểm tra thì số lần làm phải bằng 1');
    }

    const baiKiemTra = this.baiKiemTraRepo.create({
      tenBaiKiemTra: createBaiKiemTraDto.tenBaiKiemTra,
      loaiKiemTra: createBaiKiemTraDto.loaiKiemTra,
      soLanLam: createBaiKiemTraDto.soLanLam,
      xemBaiLam: createBaiKiemTraDto.xemBaiLam,
      hienThiKetQua: createBaiKiemTraDto.hienThiKetQua,
      thoiGianBatDau: createBaiKiemTraDto.thoiGianBatDau,
      thoiGianKetThuc: createBaiKiemTraDto.thoiGianKetThuc,
      thoiGianLam: createBaiKiemTraDto.thoiGianLam,
      idLopHocPhan: createBaiKiemTraDto.idLopHocPhan,
    });

    try {
      const baiKiemTraSaved = await this.baiKiemTraRepo.save(baiKiemTra);
      
      // Tự động tạo bài làm cho tất cả sinh viên trong lớp
      await this.baiLamSinhVienService.taoBaiLamChoTatCaSinhVien(
        baiKiemTraSaved.id,
        createBaiKiemTraDto.idLopHocPhan,
        createBaiKiemTraDto.soLanLam,
      );
      
      return baiKiemTraSaved;
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi tạo bài kiểm tra');
    }
  }

  async timTatCaBaiKiemTraTheoIdLopHocPhan(idLopHocPhan: number, filter: FilterChiTietBaiKiemTraDto) {
    await this.lopHocPhanService.timMotLopHocPhanTheoId(idLopHocPhan);
    return await this.baiKiemTraRepo.find({
      where: { idLopHocPhan },
      order: { update_at: 'DESC' },
    });
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
    const entity = await this.baiKiemTraRepo.findOneBy({ id: idBaiKiemTra });
    if (!entity) throw new NotFoundException(`Không tìm thấy bài kiểm tra ${idBaiKiemTra}`);

    // Lấy giá trị cuối cùng sẽ lưu
    const loaiCuoi = updateBaiKiemTraDto.loaiKiemTra ?? entity.loaiKiemTra;
    const soLanCuoi = updateBaiKiemTraDto.soLanLam ?? entity.soLanLam;

    // Ràng buộc nghiệp vụ
    if (loaiCuoi === LoaiKiemTra.BaiKiemTra && soLanCuoi !== 1) {
      throw new BadRequestException('Nếu loại kiểm tra là Bài kiểm tra thì số lần làm phải bằng 1');
    }

    try {
      // Cập nhật số lần làm nếu thay đổi
      if (updateBaiKiemTraDto.soLanLam && updateBaiKiemTraDto.soLanLam !== entity.soLanLam) {
        await this.baiLamSinhVienService.capNhatSoLanLamBai(
          idBaiKiemTra,
          entity.idLopHocPhan,
          updateBaiKiemTraDto.soLanLam,
        );
      }

      Object.assign(entity, updateBaiKiemTraDto);
      return await this.baiKiemTraRepo.save(entity);
    } catch (err) {
      throw new InternalServerErrorException('Cập nhật bài kiểm tra không thành công');
    }
  }

  async xoaBaiKiemTRaTheoIdBaiKiemTRa(idBaiKiemTra: number) {
    await this.timMotBaiKiemTraTheoIdBaiKiemTra(idBaiKiemTra);

    try {
      // Xóa tất cả bài làm của sinh viên trước
      await this.baiLamSinhVienService.xoaTatCaBaiLamTheoIdBaiKiemTra(idBaiKiemTra);
      
      // Xóa bài kiểm tra
      return await this.baiKiemTraRepo.delete(idBaiKiemTra);
    } catch (err) {
      throw new InternalServerErrorException('Xóa bài kiểm tra không thành công');
    }
  }

  /**CRUD câu hỏi trong bài kiểm tra */
  async layTatCaCauHoiCoTrongBaiKiemTraTheoIdBaiKiemTra(idBaiKiemTra: number, pagination: Pagination) {
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
        'ctch.update_at',
        'bkt.id',
        'bkt.loaiKiemTra',
        'bkt.hienThiKetQua',
        'bkt.xemBaiLam',
        'ch.id',
        'ch.tenHienThi',
        'ch.noiDungCauHoi',
        'ch.noiDungCauHoiHTML',
        'ch.loaiCauHoi',
        'ch.doKho',
      ]);

      const skip = Math.max(0, Number(pagination?.skip ?? 0));
      const limit = Math.max(1, Number(pagination?.limit ?? DEFAULT_PAGE_LIMIT));

      return await qb.orderBy('ctch.update_at', 'DESC')
        .skip(skip)
        .take(limit)
        .getMany();
    } catch (err) {
      throw new InternalServerErrorException('Lỗi khi lấy tất cả câu hỏi có trong bài kiểm tra');
    }
  }

  async themMangCauHoiVaoTrongBaiKiemTra(createChiTietDto: CreateChiTietBaiKiemTraDto) {
    const { idBaiKiemTra, mangIdCauHoi } = createChiTietDto;

    await this.timMotBaiKiemTraTheoIdBaiKiemTra(idBaiKiemTra);

    // Làm sạch & loại trùng trong input
    const ids = Array.from(new Set(mangIdCauHoi)).filter((x) => Number.isInteger(x));
    if (ids.length === 0) throw new BadRequestException('mangIdCauHoi không được để trống');

    // Kiểm tra id không tồn tại
    const cauHoiList = await this.cauHoiService.timMangCauHoiTheoMangIdCauHoi(mangIdCauHoi);
    const foundIds = new Set(cauHoiList.map((c) => c.id));
    const notFound = ids.filter((id) => !foundIds.has(id));
    if (notFound.length) {
      throw new BadRequestException(`Các idCauHoi không tồn tại: [${notFound.join(', ')}]`);
    }

    // Chặn trùng đã có trong bài kiểm tra
    const existed = await this.chiTietCauHoiBaiKiemTraRepo.find({
      where: { idBaiKiemTra, idCauHoi: In(ids) },
      select: { idCauHoi: true },
    });
    if (existed.length) {
      const existedIds = existed.map((e) => e.idCauHoi);
      throw new BadRequestException(
        `Các idCauHoi đã có trong bài kiểm tra: [${existedIds.join(', ')}]`
      );
    }

    try {
      const danhSachChiTietBaiKiemTra = ids.map(id => 
        this.chiTietCauHoiBaiKiemTraRepo.create({
          idCauHoi: id,
          idBaiKiemTra: idBaiKiemTra,
        })
      );

      // Lưu chi tiết câu hỏi bài kiểm tra
      const chiTietSaved = await this.chiTietCauHoiBaiKiemTraRepo.save(danhSachChiTietBaiKiemTra);

      // Tự động thêm chi tiết bài làm cho tất cả sinh viên
      const mangIdChiTiet = chiTietSaved.map(ct => ct.id);
      await this.baiLamSinhVienService.themChiTietBaiLamKhiThemCauHoi(idBaiKiemTra, mangIdChiTiet);

      return chiTietSaved;
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi thêm mảng id câu hỏi vào trong bài kiểm tra');
    }
  }

  async capNhatMangCauHoiCoTrongBaiKiemTra(dto: CreateChiTietBaiKiemTraDto) {
    const { idBaiKiemTra } = dto;
    // Lọc trùng + chỉ giữ số hợp lệ
    const ids = Array.from(new Set(dto.mangIdCauHoi.map(Number))).filter(Number.isFinite);

    return await this.chiTietCauHoiBaiKiemTraRepo.manager.transaction(async (manager) => {
      const chiTietRepo = manager.getRepository(ChiTietCauHoiBaiKiemTra);

      // Nếu mảng rỗng: xóa hết chi tiết của bài kiểm tra
      if (ids.length === 0) {
        await chiTietRepo.delete({ idBaiKiemTra });
        // Xóa chi tiết bài làm tương ứng
        await this.baiLamSinhVienService.capNhatChiTietBaiLamKhiCapNhatCauHoi(idBaiKiemTra, []);
        return [];
      }

      // Lấy chi tiết hiện tại
      const existing = await chiTietRepo.find({
        where: { idBaiKiemTra },
        select: { id: true, idCauHoi: true },
      });

      const existedSet = new Set(existing.map((e) => e.idCauHoi));

      // 1) XÓA: mọi dòng không nằm trong mảng ids
      const idsToDelete = existing
        .filter(e => !ids.includes(e.idCauHoi))
        .map(e => e.id);

      if (idsToDelete.length > 0) {
        await chiTietRepo.delete(idsToDelete);
      }

      // 2) THÊM: chỉ chèn những id chưa tồn tại
      const toInsert = ids
        .filter((id) => !existedSet.has(id))
        .map((id) => chiTietRepo.create({ idBaiKiemTra, idCauHoi: id }));

      let newChiTietIds: number[] = [];
      if (toInsert.length) {
        const inserted = await chiTietRepo.save(toInsert);
        newChiTietIds = inserted.map(ct => ct.id);
      }

      // 3) Cập nhật chi tiết bài làm
      const finalIds = existing
        .filter(e => ids.includes(e.idCauHoi))
        .map(e => e.id)
        .concat(newChiTietIds);

      await this.baiLamSinhVienService.capNhatChiTietBaiLamKhiCapNhatCauHoi(idBaiKiemTra, finalIds);

      // 4) Trả về danh sách đã đồng bộ
      return await chiTietRepo.find({
        where: { idBaiKiemTra },
        relations: ['cauHoi'],
        order: { update_at: 'DESC' },
      });
    });
  }

  async xoaCauHoiCoTrongBaiKiemTra(idChiTietBaiKiemTra: number) {
    try {
      // Xóa chi tiết bài làm trước
      await this.baiLamSinhVienService.xoaChiTietBaiLamKhiXoaCauHoi(idChiTietBaiKiemTra);
      
      // Xóa chi tiết câu hỏi
      return await this.chiTietCauHoiBaiKiemTraRepo.delete(idChiTietBaiKiemTra);
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi xóa câu hỏi trong bài kiểm tra');
    }
  }
}
import { forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DeepPartial } from 'typeorm';
import { BaiLamSinhVien } from './entities/bai-lam-sinh-vien.entity';
import { ChiTietBaiLam } from './entities/chi-tiet-bai-lam.entity';
import { TrangThaiBaiLam } from 'src/common/enum/trangThaiBaiLam.enum';
import { LopHocPhanService } from 'src/lop-hoc-phan/lop-hoc-phan.service';

@Injectable()
export class BaiLamSinhVienService {
  constructor(
    @InjectRepository(BaiLamSinhVien)
    private baiLamSinhVienRepo: Repository<BaiLamSinhVien>,
    @InjectRepository(ChiTietBaiLam)
    private chiTietBaiLamRepo: Repository<ChiTietBaiLam>,
    @Inject(forwardRef(() => LopHocPhanService))
    private lopHocPhanService: LopHocPhanService,
  ) {}

  /**
   * Tạo bài làm cho tất cả sinh viên trong lớp học phần khi tạo đề mới
   */
  async taoBaiLamChoTatCaSinhVien(
    idBaiKiemTra: number,
    idLopHocPhan: number,
    soLanLam: number,
  ) {
    try {
      // Lấy danh sách sinh viên trong lớp
      const lopHocPhan = await this.lopHocPhanService.timMotLopHocPhanTheoId(idLopHocPhan);
      const danhSachSinhVien = await lopHocPhan.sinhVien;

      if (!danhSachSinhVien || danhSachSinhVien.length === 0) {
        return []; // Không có sinh viên trong lớp
      }

      const danhSachBaiLam: BaiLamSinhVien[] = [];

      // Tạo bài làm cho mỗi sinh viên theo số lần làm
      for (const sinhVien of danhSachSinhVien) {
        for (let lan = 1; lan <= soLanLam; lan++) {
          const payload: DeepPartial<BaiLamSinhVien> = {
            trangThaiBaiLam: TrangThaiBaiLam.ChuaLam,
            // tongDiem: null,
            // thoiGianBatDau: null,
            // thoiGianketThuc: null, // dùng đúng tên như entity hiện tại
            lanLamThu: lan,
            idSinhVien: sinhVien.idNguoiDung,
            idBaiKiemTra: idBaiKiemTra,
          };
          const baiLam = this.baiLamSinhVienRepo.create(payload); // trả về 1 object, không annotate mảng
          danhSachBaiLam.push(baiLam);
        }
      }

      return await this.baiLamSinhVienRepo.save(danhSachBaiLam);
    } catch (error) {
      console.error('Error in taoBaiLamChoTatCaSinhVien:', error);
      throw new InternalServerErrorException(
        'Lỗi khi tạo bài làm cho sinh viên',
      );
    }
  }

  /**
   * Xóa tất cả bài làm của sinh viên khi xóa đề
   */
  async xoaTatCaBaiLamTheoIdBaiKiemTra(idBaiKiemTra: number) {
    try {
      // Lấy danh sách bài làm trước
      const danhSachBaiLam = await this.baiLamSinhVienRepo.find({
        where: { idBaiKiemTra },
        select: ['id']
      });

      if (danhSachBaiLam.length === 0) {
        return { deleted: 0 };
      }

      const mangIdBaiLam = danhSachBaiLam.map(bl => bl.id);

      // Xóa chi tiết bài làm trước
      await this.chiTietBaiLamRepo.delete({
        idBaiLamSinhVien: In(mangIdBaiLam)
      });

      // Xóa bài làm
      const result = await this.baiLamSinhVienRepo.delete({ idBaiKiemTra });
      return result;
    } catch (error) {
      console.error('Error in xoaTatCaBaiLamTheoIdBaiKiemTra:', error);
      throw new InternalServerErrorException(
        'Lỗi khi xóa bài làm của sinh viên',
      );
    }
  }

  /**
   * Thêm chi tiết bài làm khi thêm câu hỏi vào đề
   */
  async themChiTietBaiLamKhiThemCauHoi(
    idBaiKiemTra: number,
    mangIdChiTietCauHoiBaiKiemTra: number[],
  ) {
    try {
      // Lấy tất cả bài làm của đề này
      const danhSachBaiLam = await this.baiLamSinhVienRepo.find({
        where: { idBaiKiemTra },
      });

      if (danhSachBaiLam.length === 0) {
        return []; // Không có bài làm nào
      }

      const danhSachChiTiet: ChiTietBaiLam[] = [];

      // Tạo chi tiết bài làm cho mỗi bài làm
      for (const baiLam of danhSachBaiLam) {
        for (const idChiTiet of mangIdChiTietCauHoiBaiKiemTra) {
          const chiTiet = this.chiTietBaiLamRepo.create({
            diemDat: 0,
            idCauHoiBaiKiemTra: idChiTiet,
            idBaiLamSinhVien: baiLam.id,
            idDapAn: null, // Sinh viên chưa chọn đáp án
          });
          danhSachChiTiet.push(chiTiet);
        }
      }

      return await this.chiTietBaiLamRepo.save(danhSachChiTiet);
    } catch (error) {
      console.error('Error in themChiTietBaiLamKhiThemCauHoi:', error);
      throw new InternalServerErrorException(
        'Lỗi khi thêm chi tiết bài làm',
      );
    }
  }

  /**
   * Xóa chi tiết bài làm khi xóa câu hỏi khỏi đề
   */
  async xoaChiTietBaiLamKhiXoaCauHoi(idChiTietCauHoiBaiKiemTra: number) {
    try {
      return await this.chiTietBaiLamRepo.delete({
        idCauHoiBaiKiemTra: idChiTietCauHoiBaiKiemTra,
      });
    } catch (error) {
      console.error('Error in xoaChiTietBaiLamKhiXoaCauHoi:', error);
      throw new InternalServerErrorException(
        'Lỗi khi xóa chi tiết bài làm',
      );
    }
  }

  /**
   * Cập nhật chi tiết bài làm khi cập nhật danh sách câu hỏi
   */
  async capNhatChiTietBaiLamKhiCapNhatCauHoi(
    idBaiKiemTra: number,
    mangIdChiTietMoi: number[],
  ) {
    try {
      // Lấy danh sách bài làm
      const danhSachBaiLam = await this.baiLamSinhVienRepo.find({
        where: { idBaiKiemTra },
        select: ['id']
      });

      if (danhSachBaiLam.length === 0) {
        return { xoa: 0, them: 0 };
      }

      const mangIdBaiLam = danhSachBaiLam.map(bl => bl.id);

      // Lấy chi tiết hiện tại
      const chiTietHienTai = await this.chiTietBaiLamRepo.find({
        where: {
          idBaiLamSinhVien: In(mangIdBaiLam),
        },
      });

      const mapChiTietHienTai = new Map<string, ChiTietBaiLam>();
      chiTietHienTai.forEach((ct) => {
        const key = `${ct.idBaiLamSinhVien}-${ct.idCauHoiBaiKiemTra}`;
        mapChiTietHienTai.set(key, ct);
      });

      // Xác định chi tiết cần xóa
      const chiTietCanXoa: number[] = [];
      const setIdMoi = new Set(mangIdChiTietMoi);

      chiTietHienTai.forEach((ct) => {
        if (!setIdMoi.has(ct.idCauHoiBaiKiemTra)) {
          chiTietCanXoa.push(ct.id);
        }
      });

      // Xóa chi tiết không còn trong danh sách
      if (chiTietCanXoa.length > 0) {
        await this.chiTietBaiLamRepo.delete(chiTietCanXoa);
      }

      // Thêm chi tiết mới
      const chiTietCanThem: ChiTietBaiLam[] = [];
      for (const baiLam of danhSachBaiLam) {
        for (const idChiTiet of mangIdChiTietMoi) {
          const key = `${baiLam.id}-${idChiTiet}`;
          if (!mapChiTietHienTai.has(key)) {
            const chiTiet = this.chiTietBaiLamRepo.create({
              diemDat: 0,
              idCauHoiBaiKiemTra: idChiTiet,
              idBaiLamSinhVien: baiLam.id,
              idDapAn: null,
            });
            chiTietCanThem.push(chiTiet);
          }
        }
      }

      if (chiTietCanThem.length > 0) {
        await this.chiTietBaiLamRepo.save(chiTietCanThem);
      }

      return { xoa: chiTietCanXoa.length, them: chiTietCanThem.length };
    } catch (error) {
      console.error('Error in capNhatChiTietBaiLamKhiCapNhatCauHoi:', error);
      throw new InternalServerErrorException(
        'Lỗi khi cập nhật chi tiết bài làm',
      );
    }
  }

  /**
   * Cập nhật số lần làm bài
   */
  async capNhatSoLanLamBai(
    idBaiKiemTra: number,
    idLopHocPhan: number,
    soLanLamMoi: number,
  ) {
    try {
      // Lấy danh sách sinh viên
      const lopHocPhan = await this.lopHocPhanService.timMotLopHocPhanTheoId(idLopHocPhan);
      const danhSachSinhVien = await lopHocPhan.sinhVien;

      if (!danhSachSinhVien || danhSachSinhVien.length === 0) {
        return { them: 0, xoa: 0 };
      }

      // Lấy bài làm hiện tại
      const baiLamHienTai = await this.baiLamSinhVienRepo.find({
        where: { idBaiKiemTra },
      });

      // Nhóm theo sinh viên
      const mapBaiLam = new Map<number, BaiLamSinhVien[]>();
      baiLamHienTai.forEach((bl) => {
        const idSV = bl.idSinhVien;
        if (!mapBaiLam.has(idSV)) {
          mapBaiLam.set(idSV, []);
        }
        mapBaiLam.get(idSV)?.push(bl);
      });

      const baiLamCanThem: BaiLamSinhVien[] = [];
      const baiLamCanXoa: number[] = [];

      for (const sv of danhSachSinhVien) {
        const baiLamCuaSV = mapBaiLam.get(sv.idNguoiDung) || [];
        const soLanHienTai = baiLamCuaSV.length;

        if (soLanHienTai < soLanLamMoi) {
          // Thêm bài làm
          for (let lan = soLanHienTai + 1; lan <= soLanLamMoi; lan++) {
            const payload: DeepPartial<BaiLamSinhVien> = {
            trangThaiBaiLam: TrangThaiBaiLam.ChuaLam,
            // tongDiem: null,
            // thoiGianBatDau: null,
            // thoiGianketThuc: null, // dùng đúng tên như entity hiện tại
            lanLamThu: lan,
            idSinhVien: sv.idNguoiDung,
            idBaiKiemTra: idBaiKiemTra,
          };
          const baiLam = this.baiLamSinhVienRepo.create(payload); 
            baiLamCanThem.push(baiLam);
          }
        } else if (soLanHienTai > soLanLamMoi) {
          // Xóa bài làm thừa (xóa từ lần làm lớn nhất)
          const baiLamSapXep = baiLamCuaSV.sort((a, b) => b.lanLamThu - a.lanLamThu);
          for (let i = 0; i < soLanHienTai - soLanLamMoi; i++) {
            baiLamCanXoa.push(baiLamSapXep[i].id);
          }
        }
      }

      if (baiLamCanThem.length > 0) {
        await this.baiLamSinhVienRepo.save(baiLamCanThem);
      }

      if (baiLamCanXoa.length > 0) {
        // Xóa chi tiết trước
        await this.chiTietBaiLamRepo.delete({
          idBaiLamSinhVien: In(baiLamCanXoa),
        });
        await this.baiLamSinhVienRepo.delete(baiLamCanXoa);
      }

      return { them: baiLamCanThem.length, xoa: baiLamCanXoa.length };
    } catch (error) {
      console.error('Error in capNhatSoLanLamBai:', error);
      throw new InternalServerErrorException(
        'Lỗi khi cập nhật số lần làm bài',
      );
    }
  }

  // Các method cũ
  create(createBaiLamSinhVienDto: any) {
    return 'This action adds a new baiLamSinhVien';
  }

  findAll() {
    return `This action returns all baiLamSinhVien`;
  }

  findOne(id: number) {
    return `This action returns a #${id} baiLamSinhVien`;
  }

  update(id: number, updateBaiLamSinhVienDto: any) {
    return `This action updates a #${id} baiLamSinhVien`;
  }

  remove(id: number) {
    return `This action removes a #${id} baiLamSinhVien`;
  }
}
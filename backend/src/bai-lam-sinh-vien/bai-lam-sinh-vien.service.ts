import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DeepPartial, DataSource, Any } from 'typeorm';
import { BaiLamSinhVien } from './entities/bai-lam-sinh-vien.entity';
import { ChiTietBaiLam } from './entities/chi-tiet-bai-lam.entity';
import { TrangThaiBaiLam } from 'src/common/enum/trangThaiBaiLam.enum';
import { LopHocPhanService } from 'src/lop-hoc-phan/lop-hoc-phan.service';
import { CreateBaiLamSinhVienDto } from './dto/create-bai-lam-sinh-vien.dto';
import { SinhVienService } from 'src/sinh-vien/sinh-vien.service';
import { BaiKiemTraService } from 'src/bai-kiem-tra/bai-kiem-tra.service';
import { ChiTietCauHoiBaiKiemTra } from 'src/bai-kiem-tra/entities/chi-tiet-cau-hoi-bai-kiem-tra';
import { UpdateChiTietCauHoiDto, UpdateDanhSachChiTietDto } from './dto/update-chi-tiet-cau-hoi.dto';

@Injectable()
export class BaiLamSinhVienService {
  constructor(
    @InjectRepository(BaiLamSinhVien)
    private baiLamSinhVienRepo: Repository<BaiLamSinhVien>,
    @InjectRepository(ChiTietBaiLam)
    private chiTietBaiLamRepo: Repository<ChiTietBaiLam>,
    @Inject(forwardRef(() => LopHocPhanService)) private lopHocPhanService: LopHocPhanService,
    private readonly dataSource: DataSource,
   
    private sinhVienService: SinhVienService,
    private baiKiemTraService: BaiKiemTraService
  ) {}

  /**
   * Tạo bài làm cho sinh viên
   */
    async sinhVienLamBai(
      createBLSVDto: CreateBaiLamSinhVienDto,
      idSinhVien: number,
    ) {
      const { idBaiKiemTra } = createBLSVDto;

      return this.dataSource.transaction(async (manager) => {
        // 1) Lấy tất cả câu hỏi của bài kiểm tra
        const dsChiTietCauHoi = await manager.find(ChiTietCauHoiBaiKiemTra, {
          where: { idBaiKiemTra },
          // để tránh rối với lazy, ta sẽ tự await quan hệ bên dưới
          order: { id: 'ASC' },
        });

        if (dsChiTietCauHoi.length === 0) {
          throw new BadRequestException('Bài kiểm tra chưa có câu hỏi nào.');
        }

        // 2) Tạo bài làm (đang làm)
        const baiLam = manager.create(BaiLamSinhVien, {
          trangThaiBaiLam: TrangThaiBaiLam.DangLam,
          thoiGianBatDau: new Date(),
          idSinhVien,
          idBaiKiemTra,
        });
        await manager.save(baiLam);

        // 3) Tạo hàng loạt ChiTietBaiLam (snapshot link theo idCauHoiBaiKiemTra)
        const toCreate = dsChiTietCauHoi.map((ctch) =>
          manager.create(ChiTietBaiLam, {
            idBaiLamSinhVien: baiLam.id,
            idCauHoiBaiKiemTra: ctch.id,
            // diemDat: 0,
            mangIdDapAn: null, // SV chưa chọn
            // nếu bạn có thêm cột orderIndex/markedForReview/gradingStatus… thì set ở đây
          }),
        );
        // Lưu và lấy lại bản đã có id
        const chiTietSaved = await manager.save(ChiTietBaiLam, toCreate);

        // Map nhanh: idCauHoiBaiKiemTra -> ChiTietBaiLam đã lưu
        const mapCT = new Map<number, ChiTietBaiLam>(
          chiTietSaved.map((row) => [row.idCauHoiBaiKiemTra, row]),
        );

        // 4) Chuẩn hóa dữ liệu trả về: bài làm + câu hỏi + đáp án + id chi tiết
        const payload = {
          baiLam: {
            id: baiLam.id,
            idSinhVien: baiLam.idSinhVien,
            idBaiKiemTra: baiLam.idBaiKiemTra,
            trangThaiBaiLam: baiLam.trangThaiBaiLam,
            thoiGianBatDau: baiLam.thoiGianBatDau,
          },
          cauHoi: await Promise.all(
            dsChiTietCauHoi.map(async (ctch) => {
              const cauHoi = await ctch.cauHoi;     // lazy -> cần await
              const dapAn = await cauHoi.dapAn;     // lazy -> cần await
              const ct = mapCT.get(ctch.id)!;

              return {
                idChiTietBaiLam: ct.id,
                idCauHoiBaiKiemTra: ctch.id,
                cauHoi: {
                  id: cauHoi.id,
                  noiDung: cauHoi.noiDungCauHoiHTML,
                  loai: cauHoi.loaiCauHoi,
                  tenHienThi: cauHoi.tenHienThi,
                },
                dapAn: dapAn.map((da) => ({
                  id: da.id,
                  noiDung: da.noiDungHTML,
                  // KHÔNG trả isCorrect cho SV đang làm bài
                })),
                // lựa chọn hiện tại của SV (lúc mới tạo là rỗng)
                luaChon: {
                  mangIdDapAn: ct.mangIdDapAn ?? [],
                },
              };
            }),
          ),
        };

        return payload;
      });
    }

    async luuTamDapAn(
    idBaiLamSinhVien: number,
    danhSach: UpdateChiTietCauHoiDto[],
  ) {
    return this.dataSource.transaction(async (manager) => {
      const dsChiTiet = await manager.find(ChiTietBaiLam, {
        where: { idBaiLamSinhVien },
      });

      const mapCT = new Map<number, ChiTietBaiLam>(
        dsChiTiet.map((ct) => [ct.idCauHoiBaiKiemTra, ct]),
      );

      for (const item of danhSach) {
        const ct = mapCT.get(item.idCauHoiBaiKiemTra);
        if (ct) {
          ct.mangIdDapAn = item.mangIdDapAn;
          await manager.save(ct);
        }
      }

      return { message: 'Lưu tạm thành công' };
    });
    }

 async nopbai(idBaiLamSinhVien: number) {
  return this.dataSource.transaction(async (manager) => {
    const baiLam = await manager.findOne(BaiLamSinhVien, {
      where: { id: idBaiLamSinhVien },
    });

    if (!baiLam) {
      throw new NotFoundException('Không tìm thấy bài làm.');
    }

    if (baiLam.trangThaiBaiLam === TrangThaiBaiLam.DaNop) {
      throw new BadRequestException('Bài làm đã được nộp trước đó.');
    }

    // --- TÍNH ĐIỂM ---
    const dsChiTiet = await manager.find(ChiTietBaiLam, {
      where: { idBaiLamSinhVien },
    });

    let tongDapAnDung = 0;
    let tongDapAnToanBo = 0;

    for (const ct of dsChiTiet) {
      const ctch = await manager.findOne(ChiTietCauHoiBaiKiemTra, {
        where: { id: ct.idCauHoiBaiKiemTra },
        relations: ['cauHoi', 'cauHoi.dapAn'],
      });

      const cauHoi = await ctch?.cauHoi;
      if (!cauHoi) continue;

      const dsDapAn = await cauHoi.dapAn;
      const dapAnDung = dsDapAn.filter(d => d.dapAnDung).map(d => d.id);

      tongDapAnToanBo += dapAnDung.length;

      const daChon = ct.mangIdDapAn ?? [];
      const soDung = daChon.filter(id => dapAnDung.includes(id)).length;
      tongDapAnDung += soDung;
    }

    const tongDiem = tongDapAnToanBo === 0 
      ? 0 
      : Number(((tongDapAnDung / tongDapAnToanBo) * 10).toFixed(2));

    // Cập nhật
    baiLam.trangThaiBaiLam = TrangThaiBaiLam.DaNop;
    baiLam.thoiGianketThuc = new Date();
    baiLam.tongDiem = tongDiem;

    await manager.save(baiLam);

    return {
      message: 'Nộp bài thành công',
      tongDiem,
      tongDapAnDung,
      tongDapAnToanBo,
    };
  });
}

    async xemLaiBaiLam(idBaiLamSinhVien: number) {
    // 1) Lấy bài làm
    const blRepo = this.dataSource.getRepository(BaiLamSinhVien);
    const ctblRepo = this.dataSource.getRepository(ChiTietBaiLam);
    const ctchRepo = this.dataSource.getRepository(ChiTietCauHoiBaiKiemTra);

    const baiLam = await blRepo.findOne({ where: { id: idBaiLamSinhVien } });
    if (!baiLam) throw new NotFoundException('Không tìm thấy bài làm.');

    // 2) Kiểm tra quyền xem: đã nộp hoặc GV/ADMIN

    const choPhepXem = baiLam.trangThaiBaiLam === TrangThaiBaiLam.DaNop

    if (!choPhepXem) {
      throw new ForbiddenException('Bạn chưa thể xem lại bài khi chưa nộp.');
    }

    // 3) Lấy toàn bộ chi tiết
    const dsChiTiet = await ctblRepo.find({
      where: { idBaiLamSinhVien },
      order: { id: 'ASC' },
    });
    if (!dsChiTiet.length) {
      throw new NotFoundException('Bài làm chưa có chi tiết.');
    }

    // 4) Duyệt từng câu: lấy câu hỏi + đáp án đúng, gắn cờ selected cho từng đáp án
    let tongDapAnDung = 0;
    let tongDapAnToanBo = 0;

    const items = await Promise.all(
      dsChiTiet.map(async (ct) => {
        const ctch = await ctchRepo.findOne({ where: { id: ct.idCauHoiBaiKiemTra } });
        if (!ctch) {
          return {
            idChiTietBaiLam: ct.id,
            idCauHoiBaiKiemTra: ct.idCauHoiBaiKiemTra,
            cauHoi: null,
            dapAn: [],
            daChon: ct.mangIdDapAn ?? [],
          };
        }

        const cauHoi = await ctch.cauHoi;      // lazy
        const dsDapAn = await cauHoi.dapAn;    // lazy

        const dungIds = dsDapAn.filter(d => d.dapAnDung).map(d => d.id);
        const daChonSet = new Set(ct.mangIdDapAn ?? []);

        tongDapAnToanBo += dungIds.length;
        // số đáp án đúng mà SV đã chọn ở câu này
        const soDungCau = (ct.mangIdDapAn ?? []).reduce(
          (acc, id) => acc + (dungIds.includes(id) ? 1 : 0),
          0,
        );
        tongDapAnDung += soDungCau;

        return {
          idChiTietBaiLam: ct.id,
          idCauHoiBaiKiemTra: ctch.id,
          cauHoi: {
            id: cauHoi.id,
            tenHienThi: cauHoi.tenHienThi,
            noiDung: cauHoi.noiDungCauHoiHTML,
            loai: cauHoi.loaiCauHoi,
          },
          daChon: ct.mangIdDapAn ?? [],
          dapAn: dsDapAn.map((d) => ({
            id: d.id,
            noiDung: d.noiDungHTML,
            isCorrect: !!d.dapAnDung,
            selected: daChonSet.has(d.id),
          })),
        };
      })
    );

    // 5) Tính điểm thang 10 theo tổng số đáp án đúng
    const diemThang10 =
      tongDapAnToanBo === 0 ? 0 : Number(((tongDapAnDung / tongDapAnToanBo) * 10).toFixed(2));

    return {
      baiLam: {
        id: baiLam.id,
        idSinhVien: baiLam.idSinhVien,
        idBaiKiemTra: baiLam.idBaiKiemTra,
        trangThai: baiLam.trangThaiBaiLam,
        tongDiem: baiLam.tongDiem, // nếu trước đó bạn đã lưu; có thể khác với tính lại nếu chưa đồng bộ
        diemTinhLai: diemThang10,  // điểm tính realtime theo công thức hiện tại
        thoiGianBatDau: baiLam.thoiGianBatDau,
        thoiGianketThuc: baiLam.thoiGianketThuc,
      },
      thongKe: {
        tongCau: dsChiTiet.length,
        tongDapAnDung,
        tongDapAnToanBo,
        diemThang10,
      },
      chiTiet: items,
    };
  }
    async tiepTucLamBai(idBaiLamSinhVien: number) {
      return this.dataSource.transaction(async (manager) => {
        // 1) Bài làm phải thuộc SV và đang "Đang làm"
        const baiLam = await manager.findOne(BaiLamSinhVien, {
          where: { id: idBaiLamSinhVien, trangThaiBaiLam: TrangThaiBaiLam.DangLam },
        });
        if (!baiLam) {
          throw new NotFoundException('Không tìm thấy bài làm đang làm dở.');
        }

        // 2) Lấy toàn bộ chi tiết bài làm (để lấy lựa chọn đã chọn)
        const dsChiTiet = await manager.find(ChiTietBaiLam, {
          where: { idBaiLamSinhVien },
          order: { id: 'ASC' }, // hoặc orderIndex nếu bạn có
        });
        if (!dsChiTiet.length) {
          throw new NotFoundException('Bài làm chưa có chi tiết.');
        }

        // 3) Lấy lại danh sách câu hỏi của đề theo idBaiKiemTra (giữ cùng thứ tự như khi tạo)
        const dsChiTietCauHoi = await manager.find(ChiTietCauHoiBaiKiemTra, {
          where: { idBaiKiemTra: baiLam.idBaiKiemTra },
        });

        // Map: idCauHoiBaiKiemTra -> ChiTietBaiLam (để lấy id chi tiết + lựa chọn)
        const mapCT = new Map<number, ChiTietBaiLam>(
          dsChiTiet.map((ct) => [ct.idCauHoiBaiKiemTra, ct]),
        );

        // 4) Chuẩn hóa dữ liệu trả về: đúng format yêu cầu
        const payload = {
          baiLam: {
            id: baiLam.id,
            idSinhVien: baiLam.idSinhVien,
            idBaiKiemTra: baiLam.idBaiKiemTra,
            trangThaiBaiLam: baiLam.trangThaiBaiLam,
            thoiGianBatDau: baiLam.thoiGianBatDau,
          },
          cauHoi: await Promise.all(
            dsChiTietCauHoi.map(async (ctch) => {
              const cauHoi = await ctch.cauHoi;      // lazy -> cần await
              const dapAn = await cauHoi.dapAn;      // lazy -> cần await
              const ct = mapCT.get(ctch.id);         // chi tiết tương ứng (đã lưu từ lúc start)

              return {
                idChiTietBaiLam: ct?.id ?? null,     // phòng khi record thiếu
                idCauHoiBaiKiemTra: ctch.id,
                cauHoi: {
                  id: cauHoi.id,
                  noiDung: cauHoi.noiDungCauHoi,
                  loai: cauHoi.loaiCauHoi,
                  tenHienThi: cauHoi.tenHienThi,
                },
                dapAn: (dapAn ?? []).map((da) => ({
                  id: da.id,
                  noiDung: da.noiDung,
                  // KHÔNG trả đáp án đúng ở chế độ tiếp tục làm bài
                })),
                luaChon: {
                  mangIdDapAn: ct?.mangIdDapAn ?? [],
                },
              };
            }),
          ),
        };

        return payload;
      });
    }

    async layBaiLamSinhVien(idBaiKiemTra: number, idSinhVien: number) {
      return this.baiLamSinhVienRepo
        .createQueryBuilder('bl')
        .leftJoin('bl.baiKiemTra', 'bk')
        .leftJoin('bl.sinhVien', 'sv')
        .where('"bk"."id" = :idBaiKiemTra', { idBaiKiemTra })   
        .andWhere('"sv"."idNguoiDung" = :idSinhVien', { idSinhVien }) 
        .orderBy('"bl"."update_at"', 'DESC') 
        .getMany();
    }






}
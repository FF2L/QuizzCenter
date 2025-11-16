import { Console, log } from 'console';
import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DeepPartial, DataSource, Any } from 'typeorm';
import { BaiLamSinhVien } from './entities/bai-lam-sinh-vien.entity';
import { ChiTietBaiLam } from './entities/chi-tiet-bai-lam.entity';
import { LopHocPhanService } from 'src/lop-hoc-phan/lop-hoc-phan.service';
import { CreateBaiLamSinhVienDto } from './dto/create-bai-lam-sinh-vien.dto';
import { SinhVienService } from 'src/sinh-vien/sinh-vien.service';
import { BaiKiemTraService } from 'src/bai-kiem-tra/bai-kiem-tra.service';
import { ChiTietCauHoiBaiKiemTra } from 'src/bai-kiem-tra/entities/chi-tiet-cau-hoi-bai-kiem-tra';
import { UpdateChiTietCauHoiDto, UpdateDanhSachChiTietDto } from './dto/update-chi-tiet-cau-hoi.dto';
import { LoaiKiemTra } from 'src/common/enum/loaiKiemTra.enum';
import { BaiKiemTra } from 'src/bai-kiem-tra/entities/bai-kiem-tra.entity';
import { CauHoi } from 'src/cau-hoi/entities/cau-hoi.entity';
import { DapAn } from 'src/dap-an/entities/dap-an.entity';

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
    @Inject(forwardRef(() => BaiKiemTraService))
    private baiKiemTraService: BaiKiemTraService
  ) {}

  /**
   * Tạo bài làm cho sinh viên
   */


    async sinhVienLamBai(createBLSVDto: CreateBaiLamSinhVienDto, idSinhVien: number) {
      const { idBaiKiemTra } = createBLSVDto;

      return this.dataSource.transaction(async (manager) => {
        // Lấy loại bài kiểm tra
        const bkt = await manager.findOne(BaiKiemTra, {
          where: { id: idBaiKiemTra },
          select: ['id', 'loaiKiemTra'],
        });
        if (!bkt) throw new NotFoundException('Bài kiểm tra không tồn tại');

        let dsChiTietCauHoi: ChiTietCauHoiBaiKiemTra[];

        // Nếu là bài kiểm tra → xáo theo id SV
        if (bkt.loaiKiemTra === LoaiKiemTra.BaiKiemTra) {
          const seedText = String(idSinhVien);
          dsChiTietCauHoi = await manager
            .getRepository(ChiTietCauHoiBaiKiemTra)
            .createQueryBuilder('ct')
            .where('ct."idBaiKiemTra" = :idBaiKiemTra', { idBaiKiemTra })
            .orderBy('md5(ct.id::text || :seed)', 'ASC')  
            .setParameter('seed', seedText)
            .getMany();
        } else {
          // Luyện tập: giữ nguyên
          dsChiTietCauHoi = await manager.find(ChiTietCauHoiBaiKiemTra, {
            where: { idBaiKiemTra },
            order: { id: 'ASC' },
          });
        }

        // Tạo bài làm
        const baiLam = manager.create(BaiLamSinhVien, {
          thoiGianBatDau: new Date(),
          idSinhVien,
          idBaiKiemTra,
        });
        await manager.save(baiLam);

        // Tạo chi tiết + LƯU orderIndex theo vị trí đã xáo
        const danhSachChiTietBaiKiemTra = dsChiTietCauHoi.map((ctch, idx) =>
          manager.create(ChiTietBaiLam, {
            idBaiLamSinhVien: baiLam.id,
            idCauHoiBaiKiemTra: ctch.id,
            orderIndex: idx,              
            mangIdDapAn: null,
          }),
        );
        const chiTietSaved = await manager.save(ChiTietBaiLam, danhSachChiTietBaiKiemTra);

        const mapCT = new Map<number, ChiTietBaiLam>(
          chiTietSaved.map((row) => [row.idCauHoiBaiKiemTra, row]),
        );

        // Payload trả về
        const payload = {
          baiLam: {
            id: baiLam.id,
            idSinhVien: baiLam.idSinhVien,
            idBaiKiemTra: baiLam.idBaiKiemTra,
            thoiGianBatDau: baiLam.thoiGianBatDau,
          },
          cauHoi: await Promise.all(
            dsChiTietCauHoi.map(async (ctch) => {
              const cauHoi = await manager.findOne(CauHoi, { where: { id: ctch.idCauHoi } });  
              const dapAn = await manager.find(DapAn, { where: { idCauHoi: ctch.idCauHoi } });  
              const ct = mapCT.get(ctch.id)!;

              return {
                idChiTietBaiLam: ct.id,
                idCauHoiBaiKiemTra: ctch.id,
                orderIndex: ct.orderIndex,        // tiện cho FE
                cauHoi: {
                  id: cauHoi?.id,
                  noiDung: cauHoi?.noiDungCauHoiHTML,
                  loai: cauHoi?.loaiCauHoi,
                  tenHienThi: cauHoi?.tenHienThi,
                },
                dapAn: dapAn?.map((da) => ({
                  id: da.id,
                  noiDung: da.noiDungHTML,
                })),
                luaChon: { mangIdDapAn: ct.mangIdDapAn ?? [] },
              };
            }),
          ),
        };

        return payload;
      });
    }


    async luuTamDapAn(
    body: any,
    
  ) {
    const {idChiTietBaiLam, mangIdDapAn} = body;
    console.log('Lưu tạm đáp án:', idChiTietBaiLam, mangIdDapAn);
    
    return this.dataSource.transaction(async (manager) => {
      const chiTietBaiLam = await manager.findOne(ChiTietBaiLam, {
        where: { id: idChiTietBaiLam },
      });
      console.log('Chi tiết bài làm tìm được:', chiTietBaiLam);

      if (chiTietBaiLam) {
        try {
          chiTietBaiLam.mangIdDapAn = mangIdDapAn;
          await manager.save(chiTietBaiLam);
          const baiLam = await manager.findOne(BaiLamSinhVien, {
            where: { id: chiTietBaiLam.idBaiLamSinhVien },
          });
          if (baiLam) {
            const dsChiTiet = await manager.find(ChiTietBaiLam, {
          where: { idBaiLamSinhVien: baiLam.id },
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
          : Number(((tongDapAnDung / tongDapAnToanBo) * 10).toFixed(1));

        baiLam.tongDiem = tongDiem;
        console.log('Cập nhật điểm tạm thời:', tongDiem);

        await manager.save(baiLam);

          }
          return { message: 'Lưu tạm thành công' };
        } catch (error) {
          throw new InternalServerErrorException('Lưu đáp án tạm thời thất bại');
        }
      }
    });
    }

    async nopbai(idBaiLamSinhVien: number) {
      return this.dataSource.transaction(async (manager) => {
        console.log('Nộp bài cho bài làm sinh viên ID:', idBaiLamSinhVien);
        const baiLam = await manager.findOne(BaiLamSinhVien, {
          where: { id: idBaiLamSinhVien },
        });

        if (!baiLam) {
          throw new NotFoundException('Không tìm thấy bài làm.');
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
          : Number(((tongDapAnDung / tongDapAnToanBo) * 10).toFixed(1));

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
      const blRepo = this.dataSource.getRepository(BaiLamSinhVien);
      const ctblRepo = this.dataSource.getRepository(ChiTietBaiLam);
      const ctchRepo = this.dataSource.getRepository(ChiTietCauHoiBaiKiemTra);

      const baiLam = await blRepo.findOne({ where: { id: idBaiLamSinhVien } });
      if (!baiLam) throw new NotFoundException('Không tìm thấy bài làm.');

      const dsChiTiet = await ctblRepo.find({
        where: { idBaiLamSinhVien },
        order: { orderIndex: 'ASC' },            // ✅
      });
      if (!dsChiTiet.length) throw new NotFoundException('Bài làm chưa có chi tiết.');

      let tongDapAnDung = 0;
      let tongDapAnToanBo = 0;

      const items = await Promise.all(
        dsChiTiet.map(async (ct) => {
          const ctch = await ctchRepo.findOne({ where: { id: ct.idCauHoiBaiKiemTra } });
          if (!ctch) {
            return {
              idChiTietBaiLam: ct.id,
              idCauHoiBaiKiemTra: ct.idCauHoiBaiKiemTra,
              orderIndex: ct.orderIndex,
              cauHoi: null,
              dapAn: [],
              daChon: ct.mangIdDapAn ?? [],
            };
          }

          const cauHoi = await ctch.cauHoi;
          const dsDapAn = await cauHoi.dapAn;

          const dungIds = dsDapAn.filter(d => d.dapAnDung).map(d => d.id);
          const daChonSet = new Set(ct.mangIdDapAn ?? []);

          tongDapAnToanBo += dungIds.length;
          const soDungCau = (ct.mangIdDapAn ?? []).reduce(
            (acc, id) => acc + (dungIds.includes(id) ? 1 : 0),
            0,
          );
          tongDapAnDung += soDungCau;

          return {
            idChiTietBaiLam: ct.id,
            idCauHoiBaiKiemTra: ctch.id,
            orderIndex: ct.orderIndex,
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

      const diemThang10 =
        tongDapAnToanBo === 0 ? 0 : Number(((tongDapAnDung / tongDapAnToanBo) * 10).toFixed(1));

      return {
        baiLam: {
          id: baiLam.id,
          idSinhVien: baiLam.idSinhVien,
          idBaiKiemTra: baiLam.idBaiKiemTra,
          tongDiem: baiLam.tongDiem,
          diemTinhLai: diemThang10,
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
        const baiLam = await manager.findOne(BaiLamSinhVien, { where: { id: idBaiLamSinhVien } });
        if (!baiLam) throw new NotFoundException('Không tìm thấy bài làm đang làm dở.');

        // lấy chi tiết theo thứ tự đã lưu
        const dsChiTiet = await manager.find(ChiTietBaiLam, {
          where: { idBaiLamSinhVien },
          order: { orderIndex: 'ASC' },         
        });
        if (!dsChiTiet.length) throw new NotFoundException('Bài làm chưa có chi tiết.');

        // Map để lấy lựa chọn
        const mapCT = new Map<number, ChiTietBaiLam>(dsChiTiet.map((ct) => [ct.idCauHoiBaiKiemTra, ct]));

        // Lấy ct câu hỏi tương ứng theo id trong dsChiTiet (đảm bảo trùng thứ tự)
        const payload = {
          baiLam: {
            id: baiLam.id,
            idSinhVien: baiLam.idSinhVien,
            idBaiKiemTra: baiLam.idBaiKiemTra,
            thoiGianBatDau: baiLam.thoiGianBatDau,
          },
          cauHoi: await Promise.all(
            dsChiTiet.map(async (ct) => {
              const ctch = await manager.findOne(ChiTietCauHoiBaiKiemTra, { where: { id: ct.idCauHoiBaiKiemTra } });
              const cauHoi = await ctch?.cauHoi;
              const dapAn = await cauHoi?.dapAn;
              return {
                idChiTietBaiLam: ct.id,
                idCauHoiBaiKiemTra: ctch?.id,
                orderIndex: ct.orderIndex,      // ✅
                cauHoi: {
                  id: cauHoi?.id,
                  noiDung: cauHoi?.noiDungCauHoiHTML ?? cauHoi?.noiDungCauHoi, // phòng tên field khác nhau
                  loai: cauHoi?.loaiCauHoi,
                  tenHienThi: cauHoi?.tenHienThi,
                },
                dapAn: (dapAn ?? []).map((da) => ({
                  id: da.id,
                  noiDung: da.noiDungHTML ?? da.noiDung,
                  // KHÔNG trả đáp án đúng khi tiếp tục làm
                })),
                luaChon: { mangIdDapAn: ct.mangIdDapAn ?? [] },
              };
            }),
          ),
        };

        return payload;
      });
    }


async layBaiLamSinhVien(idnguoiDung:number,idBaiKiemTra: number) {
  return this.baiLamSinhVienRepo
    .createQueryBuilder('bl')
    .leftJoin('bl.baiKiemTra', 'bk')
    .leftJoin('bl.sinhVien', 'sv')
    .where('"bk"."id" = :idBaiKiemTra', { idBaiKiemTra })
    .andWhere('"sv"."idNguoiDung" = :idnguoiDung', { idnguoiDung })
    .orderBy('"bl"."update_at"', 'DESC') 
    .getMany();
}

}
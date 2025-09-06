import { BaiKiemTra } from "src/bai-kiem-tra/entities/bai-kiem-tra.entity";
import { ChiTietCauHoiBaiKiemTra } from "src/bai-kiem-tra/entities/chi-tiet-cau-hoi-bai-kiem-tra";
import { BaiLamSinhVien } from "src/bai-lam-sinh-vien/entities/bai-lam-sinh-vien.entity";
import { ChiTietBaiLam } from "src/bai-lam-sinh-vien/entities/chi-tiet-bai-lam.entity";
import { CauHoi } from "src/cau-hoi/entities/cau-hoi.entity";
import { Chuong } from "src/chuong/entities/chuong.entity";
import { DapAn } from "src/dap-an/entities/dap-an.entity";
import { FileDinhKem } from "src/file-dinh-kem/entities/file-dinh-kem.entity";
import { GiangVien } from "src/giang-vien/entities/giang-vien.entity";
import { Khoa } from "src/khoa/entities/khoa.entity";
import { LopHocPhan } from "src/lop-hoc-phan/entities/lop-hoc-phan.entity";
import { MonHoc } from "src/mon-hoc/entities/mon-hoc.entity";
import { NguoiDung } from "src/nguoi-dung/entities/nguoi-dung.entity";
import { SinhVien } from "src/sinh-vien/entities/sinh-vien.entity";
import { ThongBao } from "src/thong-bao/entities/thong-bao.entity";
import { ThongBaoNguoiDung } from "src/thong-bao/entities/thong-bao_nguoi-dung.entity";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";



export default () :PostgresConnectionOptions => ({ //khai báo hàm trả về instance của PostgresConnectionOptions
      url: process.env.URL_POSTGRES,
    type: 'postgres',
    entities: [ThongBao, ThongBaoNguoiDung, NguoiDung, SinhVien, GiangVien, Khoa, MonHoc, LopHocPhan, FileDinhKem, DapAn,Chuong, CauHoi, BaiLamSinhVien,ChiTietBaiLam, BaiKiemTra, ChiTietCauHoiBaiKiemTra],
    port: 5432, //cổng kết nối database ko cần cũn dc vì url có rồi
    synchronize: true, //đồng bộ cở sở dữ liệu với database nghĩa là nếu entity mất column nào thì nó sẽ tự xóa cột đó trong database chỉ sử dụng khi dev
      extra: {
    family: 4, // ép dùng IPv4 để kết nối
  },
})
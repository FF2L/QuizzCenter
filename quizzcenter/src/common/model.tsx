//MonHoc 
export interface MonHoc{
    id: number,
    create_at: string,
    update_at: string,
    delete_at: string,
    maMonHoc: string,
    tenMonHoc: string
}

// Chuong 
 export interface Chuong {
    id: number,
    create_at: string,
    update_at: string,
    delete_at: string,
    tenchuong: string,
    thuTu: number,
    soluongcauhoi: number,
    idGiangVien: number,
    idMonHoc: number

 }

// export interface DapAn {
//     id: number;
//     create_at: string;
//     update_at: string;
//     delete_at: string | null;
//     noiDung: string;
//     dapAnDung: boolean;
//     idCauHoi: number;
//   }
  
//   // Câu hỏi
//   export interface CauHoi {
//     id: number;
//     create_at: string;
//     update_at: string;
//     delete_at: string | null;
//     tenHienThi: string;
//     noiDungCauHoi: string;
//     loaiCauHoi: string; // nếu BE fix enum thì mày thay = LoaiCauHoi
//     doKho: string;      // tương tự thay enum DoKho
//     idChuong: number;
//     __dapAn__: DapAn[];
//     __has_dapAn__: boolean;
//   }
  
//   // Payload chuẩn trả về
//   export interface CauHoiPayload {
//     cauHoi: CauHoi;
//   }
  
export interface DapAn {
  id: number;
  create_at: string;
  update_at: string;
  delete_at: string | null;
  noiDung: string;
  noiDungHTML: string | null; 
  dapAnDung: boolean;
  idCauHoi: number;
}

export interface CauHoi {
  id: number;
  create_at: string;
  update_at: string;
  delete_at: string | null;
  tenHienThi: string;
  noiDungCauHoi: string;
  noiDungCauHoiHTML: string | null; 
  loaiCauHoi: string;
  doKho: string;
  idChuong: number;
}
export interface FileDinhKem {
  id: number;
  create_at: string;
  update_at: string;
  delete_at: string | null;
  tenFile: string;
  duongDan: string;
  loaiFile: string;
  publicId: string;
  idCauHoi: number;
}
export interface CauHoiPayload {
  cauHoi: CauHoi;
  dapAn: DapAn[];
  mangFileDinhKem: FileDinhKem[];

}

// LopHocPhan.ts
export interface LopHocPhan {
  id: number;
  create_at: string;
  update_at: string;
  delete_at: string | null;
  maLopHoc: string;
  tenLopHoc: string;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  idMonHoc: number;
  idGiangVien: number;
}

export interface BaiKiemTra {
  id: number;
  create_at: string;
  update_at: string;
  delete_at: string | null;
  tenBaiKiemTra: string;
  loaiKiemTra: "LuyenTap" | "BaiKiemTra"; // Enum dạng string
  soLanLam: number;
  xemBaiLam: boolean;
  hienThiKetQua: boolean;
  thoiGianBatDau: string; // ISO string
  thoiGianKetThuc: string; // ISO string
  thoiGianLam: number; // thời gian làm bài tính theo giây
  idLopHocPhan: number;
}
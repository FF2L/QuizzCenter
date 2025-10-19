// src/api/bai-lam-sinh-vien.api.ts
import axios from "axios";

const API_BASE_URL = "http://localhost:3000";

// Helper lấy token
const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface CauHoi {
  id: number;
  tenHienThi: string;
  noiDung: string; // HTML
  loai: string;    // "MotDung" | "NhieuDung" | ...
}

export interface DapAn {
  id: number;
  noiDung: string; // HTML
}

export interface CauHoiItem {
  idChiTietBaiLam: number;
  idCauHoiBaiKiemTra: number;
  cauHoi: CauHoi;
  dapAn: DapAn[];
  luaChon: {
    mangIdDapAn: number[];
  };
}

export interface BaiLam {
  id: number;
  idSinhVien: number;
  idBaiKiemTra: number;
  trangThaiBaiLam: "DangLam" | "DaNop";
  thoiGianBatDau: string | number; // ISO string | epoch
  update_at?: string;
}

export interface BaiLamResponse {
  baiLam: BaiLam;
  cauHoi: CauHoiItem[];
}

export interface UpdateDapAnDto {
  idCauHoiBaiKiemTra: number;
  mangIdDapAn: number[];
}

export const BaiLamSinhVienApi = {
  // Lấy tất cả bài làm của SV theo idBaiKiemTra (controller của bạn có thể lấy idSV từ JWT)
  async layBaiLamSinhVien(idBaiKiemTra: number) {
    const res = await axios.get(
      `${API_BASE_URL}/bai-lam-sinh-vien/${idBaiKiemTra}`,
      { headers: getAuthHeader() }
    );
    return res.data;
  },

  // Tạo bài làm mới
  async taoBaiLam(idBaiKiemTra: number): Promise<BaiLamResponse> {
    const res = await axios.post(
      `${API_BASE_URL}/bai-lam-sinh-vien`,
      { idBaiKiemTra },
      { headers: getAuthHeader() }
    );
    return res.data;
  },

  // Lưu tạm đáp án — ✅ dùng idBaiLamSinhVien theo service
  async luuTamDapAn(idBaiLamSinhVien: number, danhSachDapAn: UpdateDapAnDto[]) {
    const res = await axios.patch(
      `${API_BASE_URL}/bai-lam-sinh-vien/chi-tiet-bai-lam/${idBaiLamSinhVien}`,
      danhSachDapAn,
      { headers: getAuthHeader() }
    );
    return res.data;
  },

  // Nộp bài
  async nopBai(idBaiLamSinhVien: number) {
    const res = await axios.post(
      `${API_BASE_URL}/bai-lam-sinh-vien/nop-bai/${idBaiLamSinhVien}`,
      {},
      { headers: getAuthHeader() }
    );
    return res.data;
  },

  // Tiếp tục làm bài
  async tiepTucLamBai(idBaiLamSinhVien: number): Promise<BaiLamResponse> {
    const res = await axios.get(
      `${API_BASE_URL}/bai-lam-sinh-vien/tiep-tuc-lam-bai/${idBaiLamSinhVien}`,
      { headers: getAuthHeader() }
    );
    return res.data;
  },

  // Xem lại bài làm
  async xemLaiBaiLam(idBaiLamSinhVien: number) {
    const res = await axios.get(
      `${API_BASE_URL}/bai-lam-sinh-vien/xem-lai/${idBaiLamSinhVien}`,
      { headers: getAuthHeader() }
    );
    return res.data;
  },
};

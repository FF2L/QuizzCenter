import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

// Helper để lấy token
const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface CauHoi {
  id: number;
  tenHienThi: string;
  noiDung: string;
  loai: string;
}

export interface DapAn {
  id: number;
  noiDung: string;
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

export interface BaiLamResponse {
  baiLam: {
    id: number;
    idSinhVien: number;
    idBaiKiemTra: number;
    trangThaiBaiLam: string;
    thoiGianBatDau: string;
  };
  cauHoi: CauHoiItem[];
}

export interface UpdateDapAnDto {
  idCauHoiBaiKiemTra: number;
  mangIdDapAn: number[];
}

export const BaiLamSinhVienApi = {
  // Lấy tất cả bài làm của sinh viên theo idBaiKiemTra
  async layBaiLamSinhVien(idBaiKiemTra: number) {
    const response = await axios.get(
      `${API_BASE_URL}/bai-lam-sinh-vien/${idBaiKiemTra}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Tạo bài làm mới (bắt đầu làm bài)
  async taoBaiLam(idBaiKiemTra: number): Promise<BaiLamResponse> {
    const response = await axios.post(
      `${API_BASE_URL}/bai-lam-sinh-vien`,
      { idBaiKiemTra },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Lưu tạm đáp án
  async luuTamDapAn(idBaiKiemTra: number, danhSachDapAn: UpdateDapAnDto[]) {
    const response = await axios.patch(
      `${API_BASE_URL}/bai-lam-sinh-vien/chi-tiet-bai-lam/${idBaiKiemTra}`,
      danhSachDapAn,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Nộp bài
  async nopBai(idBaiLamSinhVien: number) {
    const response = await axios.post(
      `${API_BASE_URL}/bai-lam-sinh-vien/nop-bai/${idBaiLamSinhVien}`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Tiếp tục làm bài
  async tiepTucLamBai(idBaiLamSinhVien: number): Promise<BaiLamResponse> {
    const response = await axios.get(
      `${API_BASE_URL}/bai-lam-sinh-vien/tiep-tuc-lam-bai/${idBaiLamSinhVien}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  // Xem lại bài làm
  async xemLaiBaiLam(idBaiLamSinhVien: number) {
    const response = await axios.get(
      `${API_BASE_URL}/bai-lam-sinh-vien/xem-lai/${idBaiLamSinhVien}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  }
};
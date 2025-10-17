import axiosInstance from "./axios-instance";

export interface CauHoiBaiKiemTra {
  id: number;
  idCauHoi: number;
  idBaiKiemTra: number;
  cauHoi: {
    id: number;
    tenHienThi: string;
    noiDungCauHoi: string;
    noiDungCauHoiHTML: string;
    loaiCauHoi: "MotDung" | "NhieuDung";
    doKho: string;
    dapAn: DapAn[];
  };
}

export interface DapAn {
  id: number;
  noiDungDapAn: string;
  laDapAnDung: boolean;
}

export interface BaiLamSinhVien {
  id: number;
  trangThaiBaiLam: string;
  tongDiem: number | null;
  thoiGianBatDau: string;
  thoiGianketThuc: string | null;
  idBaiKiemTra: number;
  chiTietBaiLam: ChiTietBaiLam[];
  baiKiemTra: {
    id: number;
    tenBaiKiemTra: string;
    thoiGianLam: number;
    thoiGianBatDau: string;
    thoiGianKetThuc: string;
  };
}

export interface ChiTietBaiLam {
  id: number;
  idCauHoiBaiKiemTra: number;
  mangIdDapAn: number[] | null;
  diemDat: number;
}

export interface UpdateDapAnDto {
  idCauHoiBaiKiemTra: number;
  mangIdDapAn: number[];
}

export const BaiLamSinhVienApi = {
  // Lấy hoặc tạo bài làm mới
  layBaiLamSinhVien: async (idBaiKiemTra: number): Promise<BaiLamSinhVien> => {
    const response = await axiosInstance.get(`/bai-lam-sinh-vien/${idBaiKiemTra}`);
    return response.data;
  },

  // Tạo bài làm mới
  taoBaiLam: async (idBaiKiemTra: number): Promise<BaiLamSinhVien> => {
    const response = await axiosInstance.post('/bai-lam-sinh-vien', {
      idBaiKiemTra
    });
    return response.data;
  },

  // Lưu tạm đáp án
  luuTamDapAn: async (idBaiKiemTra: number, danhSachDapAn: UpdateDapAnDto[]): Promise<any> => {
    const response = await axiosInstance.patch(
      `/bai-lam-sinh-vien/chi-tiet-bai-lam/${idBaiKiemTra}`,
      danhSachDapAn
    );
    return response.data;
  },

  // Nộp bài
  nopBai: async (idBaiLamSinhVien: number): Promise<any> => {
    const response = await axiosInstance.post(`/bai-lam-sinh-vien/nop-bai/${idBaiLamSinhVien}`);
    return response.data;
  },

  // Xem lại bài làm
  xemLaiBaiLam: async (idBaiLamSinhVien: number): Promise<BaiLamSinhVien> => {
    const response = await axiosInstance.get(`/bai-lam-sinh-vien/xem-lai/${idBaiLamSinhVien}`);
    return response.data;
  },

  // Tiếp tục làm bài
  tiepTucLamBai: async (idBaiLamSinhVien: number): Promise<BaiLamSinhVien> => {
    const response = await axiosInstance.get(`/bai-lam-sinh-vien/tiep-tuc-lam-bai/${idBaiLamSinhVien}`);
    return response.data;
  },

  // Lấy chi tiết câu hỏi
  layCauHoiBaiKiemTra: async (idBaiKiemTra: number): Promise<CauHoiBaiKiemTra[]> => {
    const response = await axiosInstance.get(`/bai-kiem-tra/chi-tiet-cau-hoi/${idBaiKiemTra}`);
    return response.data;
  }
};
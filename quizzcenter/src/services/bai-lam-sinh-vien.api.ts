import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACK_END_URL;

export interface BaiLamResponse {
  baiLam: {
    id: number;
    idSinhVien: number;
    idBaiKiemTra: number;
    thoiGianBatDau: string;
    thoiGianketThuc?: string;
    trangThaiBaiLam?: string;
  };
  cauHoi: Array<{
    idChiTietBaiLam: number;
    idCauHoiBaiKiemTra: number;
    orderIndex: number;
    cauHoi: {
      id: number;
      noiDung: string;
      loai: string;
      tenHienThi: string;
    };
    dapAn: Array<{
      id: number;
      noiDung: string;
    }>;
    luaChon: {
      mangIdDapAn: number[];
    };
    thoiGianLam: number
  }>;
}

export interface UpdateDapAnDto {
  idChiTietBaiLam: number;
  mangIdDapAn: number[];
}

export interface NopBaiResponse {
  message: string;
  tongDiem: number;
  tongDapAnDung: number;
  tongDapAnToanBo: number;
}

export class BaiLamSinhVienApi {
  private static axiosInstance: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
  });

  // Thêm interceptor để tự động thêm token
  private static getAuthHeader() {
    const accessToken = localStorage.getItem('accessTokenSV'); // hoặc lấy từ state
    return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
  }

  // Tạo bài làm mới
  static async taoBaiLam(idBaiKiemTra: number): Promise<BaiLamResponse> {
    const response = await this.axiosInstance.post<BaiLamResponse>(
      '/bai-lam-sinh-vien',
      { idBaiKiemTra },
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  // Lấy danh sách bài làm của sinh viên cho 1 bài kiểm tra
static async layBaiLamSinhVien(idBaiKiemTra: number): Promise<any[]> {
  const response = await this.axiosInstance.get(
    `/bai-lam-sinh-vien/${idBaiKiemTra}`,  // Sửa từ /bai-kiem-tra/${idBaiKiemTra}
      { headers: this.getAuthHeader() },
  );
  console.log('Lay bai lam sinh vien response:', response.data);
  return response.data;
}

  // Tiếp tục làm bài
  static async tiepTucLamBai(idBaiLamSinhVien: number): Promise<BaiLamResponse> {
    const response = await this.axiosInstance.get<BaiLamResponse>(
      `/bai-lam-sinh-vien/tiep-tuc-lam-bai/${idBaiLamSinhVien}`,
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  // Lưu tạm đáp án
  static async luuTamDapAn(
    idBaiLam: number,
    danhSachDapAn: UpdateDapAnDto[]
  ): Promise<{ message: string }> {
    const response = await this.axiosInstance.put(
      '/bai-lam-sinh-vien/chi-tiet-bai-lam',
      danhSachDapAn[0], // gửi từng câu, nếu API hỗ trợ batch thì có thể gửi danhSachDapAn
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  // Nộp bài
  static async nopBai(idBaiLam: number): Promise<NopBaiResponse> {
    const response = await this.axiosInstance.post<NopBaiResponse>(
      `/bai-lam-sinh-vien/nop-bai/${idBaiLam}`,
      {},
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }

  // Xem lại bài làm
  static async xemLaiBaiLam(idBaiLam: number): Promise<any> {
    const response = await this.axiosInstance.get(
      `/bai-lam-sinh-vien/xem-lai/${idBaiLam}`,
      { headers: this.getAuthHeader() }
    );
    return response.data;
  }
}

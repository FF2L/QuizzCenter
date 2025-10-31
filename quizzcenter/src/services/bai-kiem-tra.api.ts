// src/api/BaiKiemTraApi.ts
import { ApiClient } from "./api";

export interface BaiKiemTra {
  id: number;
  tenBaiKiemTra: string;
  loaiKiemTra: string; // "BaiKiemTra" | "LuyenTap"
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  thoiGianLam: number; // seconds
  soLanLam: number;
  xemBaiLam?: boolean;
  hienThiKetQua?: boolean;
}

export class BaiKiemTraApi extends ApiClient {
  /**
   * Lấy tất cả bài kiểm tra của lớp học phần (dành cho SINH VIÊN)
   * @param idLopHocPhan - ID của lớp học phần
   * @returns Danh sách bài kiểm tra
   */
  static async layTatCaBaiKiemTraCuaLopHocPhan(idLopHocPhan: string) {
    // Lấy accessToken từ localStorage (token sinh viên)
    const accessToken = 
      localStorage.getItem('accessToken') || 
      sessionStorage.getItem('accessToken');
    
    // Nếu không có token, throw error
    if (!accessToken) {
      throw new Error('Unauthorized: Access token is required');
    }

    const { data } = await this.instance.get<BaiKiemTra[]>(
      `/bai-kiem-tra/${idLopHocPhan}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return data;
  }

  /**
   * Lấy danh sách bài kiểm tra với phân trang (dành cho GIẢNG VIÊN)
   * @param idLopHocPhan - ID của lớp học phần
   * @param loaiKiemTra - Loại kiểm tra: "BaiKiemTra" | "LuyenTap"
   * @param skip - Số bản ghi bỏ qua
   * @param limit - Số bản ghi lấy về
   * @param tenBaiKiemTra - Tên bài kiểm tra (optional - dùng để search)
   * @returns Response với data, total, currentPage, totalPages
   */
  static async layDanhSachBaiKiemTraCoPhantrang(
    idLopHocPhan: string,
    loaiKiemTra: "BaiKiemTra" | "LuyenTap",
    skip: number = 0,
    limit: number = 10,
    tenBaiKiemTra?: string
  ) {
    // Lấy accessToken của giảng viên
    const accessToken = localStorage.getItem('accessTokenGV');
    
    if (!accessToken) {
      throw new Error('Unauthorized: Teacher access token is required');
    }

    // Xây dựng params
    const params = new URLSearchParams({
      loaiKiemTra,
      skip: skip.toString(),
      limit: limit.toString(),
    });

    if (tenBaiKiemTra && tenBaiKiemTra.trim()) {
      params.append('tenBaiKiemTra', tenBaiKiemTra.trim());
    }

    const { data } = await this.instance.get(
      `/bai-kiem-tra/${idLopHocPhan}?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return data;
  }

  /**
   * Tạo bài kiểm tra mới (dành cho GIẢNG VIÊN)
   */
  static async taoBaiKiemTra(payload: any) {
    const accessToken = localStorage.getItem('accessTokenGV');
    
    if (!accessToken) {
      throw new Error('Unauthorized: Teacher access token is required');
    }

    const { data } = await this.instance.post(
      '/bai-kiem-tra',
      payload,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return data;
  }

  /**
   * Cập nhật bài kiểm tra (dành cho GIẢNG VIÊN)
   */
  static async capNhatBaiKiemTra(id: number, payload: any) {
    const accessToken = localStorage.getItem('accessTokenGV');
    
    if (!accessToken) {
      throw new Error('Unauthorized: Teacher access token is required');
    }

    const { data } = await this.instance.patch(
      `/bai-kiem-tra/${id}`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return data;
  }

  /**
   * Xóa bài kiểm tra (dành cho GIẢNG VIÊN)
   */
  static async xoaBaiKiemTra(id: number) {
    const accessToken = localStorage.getItem('accessTokenGV');
    
    if (!accessToken) {
      throw new Error('Unauthorized: Teacher access token is required');
    }

    const { data } = await this.instance.delete(
      `/bai-kiem-tra/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return data;
  }
}
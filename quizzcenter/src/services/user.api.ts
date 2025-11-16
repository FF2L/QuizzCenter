import axios from 'axios';
import { API_URL } from "./gobal.api";
export interface UserInfo {
  id: number;
  create_at: string;
  update_at: string;
  delete_at: string | null;
  maNguoiDung: string;
  hoTen: string;
  email: string;
  soDienThoai: string;
  anhDaiDien: string;
  ngaySinh: string;
}

export interface UpdateUserDto {
  hoTen: string;
  soDienThoai: string;
  anhDaiDien: string;
  ngaySinh: string;
}

export interface ChangePasswordDto {
  matKhauCu: string;
  matKhauMoi: string;
}

export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  message?: string;
}

export class UserService {
  // Lấy access token dựa vào role
  private static getAccessToken(path?: string): string {
    const currentPath = path || window.location.pathname;
  
    if (currentPath.includes('/lecturer/')) {
      return localStorage.getItem('accessTokenGV') || '';
    } else if (currentPath.includes('/quizzcenter/')) {
      return localStorage.getItem('accessTokenSV') || '';
    } else if (currentPath.includes('/admin/')) {
      return localStorage.getItem('accessTokenAD') || '';
    }
  
    return '';
  }
  

  // Lấy thông tin người dùng
  static async getUserInfo(): Promise<ApiResponse<UserInfo>> {
    try {
      const token = this.getAccessToken();
      const response = await axios.get(`${API_URL}/nguoi-dung/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return {
        ok: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        ok: false,
        data: {} as UserInfo,
        message: error.response?.data?.message || 'Không thể lấy thông tin người dùng',
      };
    }
  }

  // Cập nhật thông tin người dùng
  static async updateUserInfo(userData: UpdateUserDto): Promise<ApiResponse<UserInfo>> {
    try {
      const token = this.getAccessToken();
      const response = await axios.patch(`${API_URL}/nguoi-dung/`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return {
        ok: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        ok: false,
        data: {} as UserInfo,
        message: error.response?.data?.message || 'Không thể cập nhật thông tin',
      };
    }
  }

  // Thay đổi mật khẩu
  static async changePassword(passwordData: ChangePasswordDto): Promise<ApiResponse<{ messages: string }>> {
    try {
      const token = this.getAccessToken();
      const response = await axios.put(`${API_URL}/nguoi-dung/mat-khau`, passwordData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      return {
        ok: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        ok: false,
        data: { messages: '' },
        message: error.response?.data?.message || 'Không thể thay đổi mật khẩu',
      };
    }
  }

  // Upload ảnh lên Cloudinary (nếu cần)
  static async uploadImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'your_upload_preset'); // Thay bằng preset của bạn
    
    try {
      const response = await axios.post(
        'https://api.cloudinary.com/v1_1/dyscafqap/image/upload',
        formData
      );
      return response.data.secure_url;
    } catch (error) {
      throw new Error('Không thể upload ảnh');
    }
  }
}
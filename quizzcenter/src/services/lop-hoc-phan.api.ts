import axios from "axios";
import { API_URL } from "./gobal.api";

export type LopHocPhanItem = {
  lhp_id: number;
  tenlhp: string;
  hocky: string;
  thoigianbatdau: string;
  thoigianketthuc: string;
  mamonhoc: string;
  tenmonhoc: string;
};

// ✅ tạo axios instance riêng cho API này
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// ✅ gắn token sinh viên vào mỗi request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessTokenSV");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ API class dùng axiosInstance
export class LopHocPhanApi {
  static async layDanhSachLopHocPhanCuaSinhVien(
    skip = 0,
    limit = 10,
    tenMonHoc?: string,
    maMonHoc?: string
  ) {
    const res = await axiosInstance.get(
      `/lop-hoc-phan/sinh-vien?skip=${skip}&limit=${limit}&tenMonHoc=${tenMonHoc ?? ""}&maMonHoc=${maMonHoc ?? ""}`
    );

    return res.data;
  }
}

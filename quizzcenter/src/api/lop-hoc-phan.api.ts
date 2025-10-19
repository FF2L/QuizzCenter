// src/api/LopHocPhanApi.ts
import { ApiClient } from "./api";

export type LopHocPhanItem = {
  lhp_id: number;
  tenlhp: string;
  hocky: string;
  thoigianbatdau: string;
  thoigianketthuc: string;
  mamonhoc: string;
  tenmonhoc: string;
};

export class LopHocPhanApi extends ApiClient {
  static async layDanhSachLopHocPhanCuaSinhVien(skip = 0, limit = 10, tenMonHoc?: string, maMonHoc?: string ) {
    const { data } = await this.instance.get<LopHocPhanItem[]>(
      `/v2/lop-hoc-phan?skip=${skip}&limit=${limit}&tenMonHoc=${tenMonHoc ?? ''}&maMonHoc=${maMonHoc ?? ''}`
    );
    return data;
  }


}

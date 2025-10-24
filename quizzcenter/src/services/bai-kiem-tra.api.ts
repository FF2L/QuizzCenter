import { ApiClient } from "./api";


export class BaiKiemTraApi extends ApiClient {
  static async layTatCaBaiKiemTraCuaLopHocPhan(idLopHocPhan: string ) {
    const { data } = await this.instance.get(
      `/bai-kiem-tra/${idLopHocPhan}`
    );
    return data;
  }


}
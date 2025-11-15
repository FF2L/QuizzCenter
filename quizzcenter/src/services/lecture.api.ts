import axios from "axios";
import { API_URL } from "./gobal.api";

export class LectureService {
    static getAllCourse = async (accessToken: string, page: number = 1, limit: number = 10, maMon?: string, tenMon?: string) => {
        console.log("Fetching courses with accessToken:", accessToken);
        try {
            const res = await axios.get(`${API_URL}/mon-hoc`, {
                params: {
                    skip: (page - 1) * limit,
                    limit,
                    maMon,
                    tenMon
                },
                headers: { 
                    Authorization: `Bearer ${accessToken}` 
                }
            });
            console.log("Courses fetched:", res.data);
            return {ok: true, data: res.data}
        } catch (error) {
            console.error("Error fetching courses:", error);
            return {ok: false, error}
        }
    };

    // API lấy tất cả chương theo môn học và người dùng

    static layTatCaChuongTheoMonHoc = async ( idMonHoc: number, accessToken: string) => {
        try {
            const res = await axios.get(`${API_URL}/chuong`, {
                params: {
                    idMonHoc
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            return {ok: true, data: res.data}
        }
            catch (error) {
            console.error("Error fetching chapters:", error);
            return {ok: false, error}
        }
    }

    
    static async taoChuongTheoMonHoc( tenChuong: string, idMonHoc: number, accessToken: string) {
        try {
            const res = await axios.post(`${API_URL}/chuong`, {
                tenChuong,
                idMonHoc
            }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            return {ok: true, data: res.data}
        } catch (error) {
            console.error("Error creating chapter:", error);
            return {ok: false, error}
        }
    }
    
    static async capNhatChuong( idChuong: number, tenChuong: string, accessToken: string) {
        try {
            const res = await axios.patch(`${API_URL}/chuong/${idChuong}`, {
                tenChuong
            }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            return {ok: true, data: res.data}
        }
        catch (error) {
            console.error("Error updating chapter:", error);
            return {ok: false, error}
        }
    }
    
    static async xoaChuongTheoIdChuong( idChuong: number, accessToken: string) {
        try {
            const res = await axios.delete(`${API_URL}/chuong/${idChuong}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            return {ok: true, data: res.data}
        }
        catch (error) {
            console.error("Error deleting chapter:", error);
            return {ok: false, error}
        }
    }
    // API tạo chương mới
    static async taoMotChuong(tenChuong: string, idMonHoc: number, idGiangVien: number, accessToken: string) {
        try {
            const res = await axios.post(`${API_URL}/lecturer/chuong`, {
                tenChuong,
                idMonHoc,
                idGiangVien
            }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            return {ok: true, data: res.data}
        } catch (error) {
            console.error("Error creating chapter:", error);
            return {ok: false, error}
        }
    }
    
    
    // API lấy tất cả câu hỏi theo chương
    static async layTatCauHoiTheoChuong  ( accessToken: string, idChuong: number, page: number = 1, limit: number = 10, doKho?: string, noiDungCauHoi?: string)  {

       try {
           const res = await axios.get(`${API_URL}/chuong/${idChuong}/cau-hoi`, {
               params: {
                   skip: (page - 1) * limit,
                   limit,
                   doKho,
                   noiDungCauHoi
               },
               headers: {
                   Authorization: `Bearer ${accessToken}`
               }
           });
           console.log("Questions fetched:", res.data);
           return {ok: true, data: res.data}
       }
           catch (error) {
           console.error("Error fetching chapters:", error);
           return {ok: false, error}
       }
    }

    static async layChiTIetCauHoi( accessToken: string, idCauHoi: number) {
        try {
            const res = await axios.get(`${API_URL}/cau-hoi/${idCauHoi}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            return {ok: true, data: res.data}
        }
        catch (error) {
            console.error("Error fetching question details:", error);
            return {ok: false, error}
        }
    }
    // ======================== API BẢNG ĐIỂM ========================

static async xemTatCaBangDiem(accessToken: string, idLopHocPhan: number, idBaiKiemTra:number) {
    try {
        const res = await axios.get(`${API_URL}/lop-hoc-phan/${idLopHocPhan}/bang-diem/bai-kiem-tra/${idBaiKiemTra}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        return { ok: true, data: res.data };
    } catch (error) {
        console.error("Error fetching all scores:", error);
        return { ok: false, error };
    }
}

static async timKiemBangDiemTheoTen(accessToken:string, idLopHocPhan:number, idBaiKiemTra:number, tenSinhVien:string) {
    try {
        const res = await axios.get(`${API_URL}/lop-hoc-phan/${idLopHocPhan}/bang-diem/bai-kiem-tra/${idBaiKiemTra}`, {
            params: { "ten-sinh-vien": tenSinhVien },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        return { ok: true, data: res.data };
    } catch (error) {
        console.error("Error searching score by name:", error);
        return { ok: false, error };
    }
}

static async xuatBangDiem(accessToken:string, idLopHocPhan:number, idBaiKiemTra:number) {
    try {
        const res = await axios.get(`${API_URL}/lop-hoc-phan/${idLopHocPhan}/bai-kiem-tra/${idBaiKiemTra}/xuat-bang-diem`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            },
            responseType: "blob" // nếu trả về file (PDF, Excel,...)
        });
        return { ok: true, data: res.data };
    } catch (error) {
        console.error("Error exporting score sheet:", error);
        return { ok: false, error };
    }
}

static async thongKeBangDiem(accessToken: string, idLopHocPhan: number, idBaiKiemTra: number) {
    try {
        const res = await axios.get(
            `${API_URL}/lop-hoc-phan/${idLopHocPhan}/bai-kiem-tra/${idBaiKiemTra}/thong-ke`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );
        return { ok: true, data: res.data };
    } catch (error) {
        console.error("Error fetching score statistics:", error);
        return { ok: false, error };
    }
}

}

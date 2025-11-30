import axios from "axios";
import { API_URL } from "./gobal.api";
import { error } from "console";
export class AdminApi {
    /* Quản lý người dùng*/
    static layTatCaNguoiDung = async (page: number = 1, limit: number = 10, tenNguoiDung?: string) => {
        try{
            console.log(page)
            const res = await axios.get(`${API_URL}/nguoi-dung/admin`, {
                params: {
                    skip: (page - 1) * limit,
                    limit,
                    tenNguoiDung
                }
            })
            return {ok: true, data: res.data}

        }catch(err){
            console.error("Error fetching users:", err);
            return {ok: false, error: err}
        }
    }
    static xoaNguoiDung = async (id:number) =>{
        try{
            const res = await axios.delete(`${API_URL}/nguoi-dung/${id}/admin`);
            return {ok: true, data: res.data}
        }catch(err){
            console.error("Error deleting user:", err);
            return {ok: false, error: err}
        }
    }
    static taoNguoiDung = async (data: any) =>{
        console.log("Data to create user:", data);
        try{
            const res = await axios.post(`${API_URL}/nguoi-dung/admin`, data);
            return {ok: true, data: res.data}
        }catch(err){
            console.error("Error creating user:", err);
            return {ok: false, error: err}
        }
    }
    static updateNguoiDung = async (id:number, data:any) =>{
        try{
            const res = await axios.put(`${API_URL}/nguoi-dung/${id}/admin`, data);
            return {ok: true, data: res.data}
        }catch(err){
            console.error("Error updating user:", err);
            return {ok: false, error: err}
        }
    }

    static uploadFileNguoiDung = async (file: File) =>{
        const formData = new FormData();
        formData.append('file', file);
        try{
            const res = await axios.post(`${API_URL}/nguoi-dung/upload-file`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return {ok: true, data: res.data}
        }catch(err){
            console.error("Error uploading user file:", err);
            return {ok: false, error: err}
        }
    }

    /* Quản lý môn học */
    static layTatCaMonHoc = async (page: number = 1, limit: number = 10, tenMonHoc?: string, sxTenMonHoc?: boolean) => {
        try{
            const res = await axios.get(`${API_URL}/mon-hoc/admin`, {
                params: {
                    skip: (page - 1) * limit,
                    limit,
                    tenMon: tenMonHoc,
                    sxTenMon: sxTenMonHoc
                }
            })
            return {ok: true, data: res.data}
        }catch(err){
            console.error("Error fetching subjects:", err);
            return {ok: false, error: err}
        }
    }
    static xoaMonHoc = async (id:number) =>{
        try{
            const res = await axios.delete(`${API_URL}/mon-hoc/${id}/admin`);
            return {ok: true, data: res.data}
        }catch(err){
            console.error("Error deleting subject:", err);
            return {ok: false, error: err}
        }
    }
    static taoMonHoc = async (data: any) =>{
        try{
            const res = await axios.post(`${API_URL}/mon-hoc/admin`, data);
            return {ok: true, data: res.data}
        }catch(err){
            console.error("Error creating subject:", err);
            return {ok: false, error: err}
        }
    }
    static updateMonHoc = async (id:number, data:any) =>{
        try{
            const res = await axios.put(`${API_URL}/mon-hoc/${id}/admin`, data);
            return {ok: true, data: res.data}
        }catch(err){
            console.error("Error updating subject:", err);
            return {ok: false, error: err}
        }
    }

    /* Quản lý lớp học phần */
    static layTatCaHocKyDangDienRa= async () =>{
        try{
            const res = await axios.get(`${API_URL}/hoc-ky/admin/dang-dien-ra`);
            console.log("Ongoing semesters fetched:", res.data);
            return {ok: true, data: res.data}
        }
        catch(err){
            console.error("Error fetching ongoing semesters:", err);
            return {ok: false, error: err}
        }

    }
    
    static layTatCaLopHocPhan = async (page: number = 1, limit: number = 10, tenLopHoc?: string) => {
        try{
            const res = await axios.get(`${API_URL}/lop-hoc-phan/all/admin`, {
                params: {
                    skip: (page - 1) * limit,
                    limit,
                    'ten-lop-hoc': tenLopHoc
                }
            })
            return {ok: true, data: res.data}
        }
        catch(err){
            console.error("Error fetching classes:", err);
            return {ok: false, error: err}
        }
    }
    static xoaLopHocPhan = async (id:number) =>{
        try{
            const res = await axios.delete(`${API_URL}/lop-hoc-phan/${id}/admin`);
            return {ok: true, data: res.data}
        }catch(err){
            console.error("Error deleting class:", err);
            return {ok: false, error: err}
        }
    }
    static taoLopHocPhan = async (data: any) =>{
        try{
            const res = await axios.post(`${API_URL}/lop-hoc-phan/admin`, data);
            return {ok: true, data: res.data}
        }catch(err){
            console.error("Error creating class:", err);
            return {ok: false, error: err}
        }   
    }
    static updateLopHocPhan = async (id:number, data:any) =>{
        try{
            const res = await axios.put(`${API_URL}/lop-hoc-phan/${id}/admin`, data);
            return {ok: true, data: res.data}
        }catch(err){
            console.error("Error updating class:", err);
            return {ok: false, error: err}
        }
    }
    static layTatCaGiangVienTheoMonHoc = async (idMonHoc: number) => {
        try{
            const res = await axios.get(`${API_URL}/giang-vien/mon-hoc/${idMonHoc}/admin`);
            return {ok: true, data: res.data}
        }catch(err){
            console.error("Error fetching lecturers by subject:", err);
            return {ok: false, error: err}
        }  
    }
    static layTatCaMonHocKhongQuery = async () => {
        try{
            const res = await axios.get(`${API_URL}/mon-hoc/admin/no-query`);
            return {ok: true, data: res.data}
        }catch(err){
            console.error("Error fetching all subjects:", err);
            return {ok: false, error: err}
        }
    }
    static layTatCaGiangVienTheoIdMonHoc = async (idMonHoc: number) => {
        try{
            const res = await axios.get(`${API_URL}/giang-vien/mon-hoc/${idMonHoc}/admin`);
            return {ok: true, data: res.data}
        }catch(err){
            console.error("Error fetching lecturers by subject ID:", err);
            return {ok: false, error: err}
        }
    }
    static xuatDanhSachSinhVienExcel = async (idLopHocPhan: number) =>{
        try{
            const res = await axios.get(`${API_URL}/lop-hoc-phan/${idLopHocPhan}/admin/xuat-danh-sach-sinh-vien`, {
                responseType: 'blob' // Quan trọng để nhận file dưới dạng blob
            });
            return {ok: true, data: res.data}
        }
        catch(err){
            console.error("Error exporting student list to Excel:", err);
            return {ok: false, error: err}
        }
    }
    static layTenLopHocPhan = async (idLopHocPhan: number) =>{
        try{
            const res = await axios.get(`${API_URL}/lop-hoc-phan/${idLopHocPhan}/admin/ten-lop-hoc-phan`);
            return {ok: true, data: res.data}
        }catch(err){
            console.error("Error fetching class name:", err);
            return {ok: false, error: err}
        }
    }
    static nhapDanhSachSinhVienExcel = async (idLopHocPhan: number, file: File) =>{
        const formData = new FormData();
        formData.append('file', file);
        try{
            const res = await axios.post(`${API_URL}/lop-hoc-phan/${idLopHocPhan}/admin/nhap-danh-sach-sinh-vien`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return {ok: true, data: res.data}
        }catch(err){
            console.error("Error importing student list from Excel:", err);
            return {ok: false, error: err}
        }
    }


    /*Phân công giảng viên vào câu hỏi */
    static layTatCaPhanCongGiangVienVaoCauHoi = async (page: number = 1, limit: number = 10, tenGiangVien?: string) =>{
        try{
            const res = await axios.get(`${API_URL}/phan-cong-cau-hoi/giang-vien/admin`, {
                params: {
                    skip: (page - 1) * limit,
                    limit,
                    tenGiangVien
                }
            })
            return {ok: true, data: res.data}
        }catch(err){
            console.error("Error fetching lecturer assignments:", err);
            return {ok: false, error: err}
        }
    }
    static layTatCaMonHocDaPhanCong = async (page: number = 1, limit: number = 10, tenGiangVien?: string, sxTenGiangVien?: boolean) => {
        console.log({page, limit, tenGiangVien});
    
        try {
            const res = await axios.get(`${API_URL}/mon-hoc/danh-sach-phan-cong/giang-vien/admin`, {
            params: {
                skip: (page - 1) * limit,
                limit,
                tenGiangVien,
                sxTenGiangVien
            },
            });
            console.log("Fetched all subjects assigned to lecturers:", res.data);
            return { ok: true, data: res.data };
        } catch (err) {
            return { ok: false, error: err };
        }
        };
    static phanCongMonHocChoGiangVien = async (idGiangVien: number, idMonHoc: number) => {
    try {
        const res = await axios.post(`${API_URL}/mon-hoc/phan-cong/giang-vien/${idGiangVien}/admin`, {
        idMonHoc,
        });
        return { ok: true, data: res.data };
    } catch (err) {
        return { ok: false, error: err };
    }
    };
    static xoaPhanCongMonHoc = async (idGiangVien: number, idMonHoc: number) => {
        console.log("API xóa phân công môn học:", { idGiangVien, idMonHoc });
        try {
            const res = await axios.delete(
            `${API_URL}/mon-hoc/xoa-phan-cong/giang-vien/${idGiangVien}/mon-hoc/${idMonHoc}/admin`
            );
            return { ok: true, data: res.data };
        } catch (err) {
            return { ok: false, error: err };
        }
    }
    static layTatCaGiangVienKhongPhanTrang = async () => {
        try{
            const res = await axios.get(`${API_URL}/giang-vien/all`);
            console.log("Fetched all lecturers without pagination:", res.data);
            return {ok: true, data: res.data}
        }catch(err){
            console.error("Error fetching all lecturers:", err);
            return {ok: false, error: err}
        }
    }

    //Quản lý học kỳ
    static layTatCaHocKy = async (tenHocKy: string) => {
        try{
            console.log("Fetching semesters with name filter:", tenHocKy);
            const res = await axios.get(`${API_URL}/hoc-ky/admin`, {    
                params: {
                    tenHocKy
                }
            })
            console.log("Fetched semesters:", res);
            return {ok: true, data: res.data}
        }
        catch(err){
            console.error("Error fetching semesters:", err);
            return {ok: false, error: err}
        }
    }

    static layTatCaHocKyPhatHanh = async () => {
        try{
            const res = await axios.get(`${API_URL}/hoc-ky/admin/phat-hanh`)
            return {ok: true, data: res.data}
        }
        catch(err){
            console.error("Error fetching published semesters:", err);
            return {ok: false, error: err}
        } 
    }

    static layHocKyTheoId = async (id: number) => {
        try{
            const res = await axios.get(`${API_URL}/hoc-ky/admin/${id}`)
            return {ok: true, data: res.data}
        }
        catch(err){
            console.error("Error fetching semester by ID:", err);
            return {ok: false, error: err}
        }
    }

    static taoHocKy = async (data: any) =>{
        try{
            const res = await axios.post(`${API_URL}/hoc-ky/admin`, data);
            return {ok: true, data: res.data}
        }catch(err){
            console.error("Error creating semester:", err);
            return {ok: false, error: err}
        }
    }

    static capNhatHocKy = async (id:number, data:any) =>{
        try{
            const res = await axios.patch(`${API_URL}/hoc-ky/admin/${id}`, data);
            return {ok: true, data: res.data}
        }catch(err){
            console.error("Error updating semester:", err);
            return {ok: false, error: err}
        }
    }

    static xoaHocKy = async (id:number) =>{
        try{
            const res = await axios.delete(`${API_URL}/hoc-ky/admin/${id}`);
            return {ok: true, data: res.data}
        }catch(err){
            console.error("Error deleting semester:", err);
            return {ok: false, error: err}
        }
    }

    // Thêm sinh viên vào lớp học phần
    static themSinhVienVaoLopHocPhan = async (idLopHocPhan: number, maSinhVien: string) => {
        try{
            const res = await axios.post(`${API_URL}/lop-hoc-phan/${idLopHocPhan}/sinh-vien/${maSinhVien}/admin`);
            return {ok: true, data: res.data}
        }catch(err){
            console.error("Error adding student to class:", err);
            return {ok: false, error: err}
        }
    }

    // Xóa sinh viên khỏi lớp học phần
    static xoaSinhVienKhoiLopHocPhan = async (idLopHocPhan: number, maSinhVien: string) => {
        try{
            const res = await axios.delete(`${API_URL}/lop-hoc-phan/${idLopHocPhan}/sinh-vien/${maSinhVien}/admin`);
            return {ok: true, data: res.data}
        }catch(err){
            console.error("Error removing student from class:", err);
            return {ok: false, error: err}
        }
    }

    // Lấy tất cả sinh viên của lớp học phần
    static layTatCaSinhVienCuaLopHocPhan = async (idLopHocPhan: number, page = 1, limit = 10, tenSinhVien?: string) => {
    try {
        const res = await axios.get(`${API_URL}/lop-hoc-phan/${idLopHocPhan}/admin`, {
        params: {
            skip: (page - 1) * limit,
            limit,
            'ten-sinh-vien': tenSinhVien
        }
        });
        console.log("Fetched students of class:", res.data);
        return { ok: true, data: res.data };
    } catch (err) {
        console.error("Error fetching students of class:", err);
        return { ok: false, error: err };
    }
    };


}
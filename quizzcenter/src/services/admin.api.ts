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

    /* Quản lý môn học */
    static layTatCaMonHoc = async (page: number = 1, limit: number = 10, tenMonHoc?: string) => {
        try{
            const res = await axios.get(`${API_URL}/mon-hoc/admin`, {
                params: {
                    skip: (page - 1) * limit,
                    limit,
                    tenMon: tenMonHoc
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
    static layTatCaMonHocDaPhanCong = async (page: number = 1, limit: number = 10, tenGiangVien?: string) => {
        console.log({page, limit, tenGiangVien});
    
        try {
            const res = await axios.get(`${API_URL}/mon-hoc/danh-sach-phan-cong/giang-vien/admin`, {
            params: {
                skip: (page - 1) * limit,
                limit,
                tenGiangVien,
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
            return {ok: true, data: res.data}
        }catch(err){
            console.error("Error fetching all lecturers:", err);
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
    // Lấy tất cả sinh viên của lớp học phần
    static layTatCaSinhVienCuaLopHocPhan = async (idLopHocPhan: number, page = 1, limit = 10, tenSinhVien?: string) => {
    try {
        const res = await axios.get(`${API_URL}/lop-hoc-phan/${idLopHocPhan}/admin`, {
        params: {
            skip: (page - 1) * limit,
            limit,
            // ⚠️ trùng với @Query('ten-sinh-vien')
            'ten-sinh-vien': tenSinhVien
        }
        });
        return { ok: true, data: res.data };
    } catch (err) {
        console.error("Error fetching students of class:", err);
        return { ok: false, error: err };
    }
    };


}
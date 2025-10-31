import { Box, Button, colors, MenuItem, Stack, Table, TableBody, TableCell, TableHead, TablePagination, TableRow, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { AdminApi } from "../../../services/admin.api";
import ConfirmDialog from "../../../common/dialog";
import { VaiTro } from "../../../common/gobal/gobal.type";
import { emailRe, phone10, toDateDisplay, toDateInput } from "../../../common/gobal/gobal.const";
import { toast } from "react-toastify";


const QuanLyNguoiDung = () => {
    const [danhSachNd, setDanhSachNd] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [showCreateRow, setShowCreateRow] = useState(false);
    const [editRowId, setEditRowId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState({
    hoTen: "",
    maNguoiDung: "",
    gioiTinh: "",
    ngaySinh: "",
    email: "",
    soDienThoai: "",
    vaiTro: "" as VaiTro,
    });
    const [form, setForm] = useState({
        hoTen: "",
        maNguoiDung: "",
        gioiTinh: "",
        ngaySinh: "",
        email: "",
        soDienThoai: "",
        vaiTro: "" as unknown as VaiTro,
    });

    //Phần sửa
    const handleClickEdit = (row: any) => {
    setShowCreateRow(false);

    setEditRowId(row.id);
    setEditForm({
        hoTen: row.hoTen ?? "",
        maNguoiDung: row.maNguoiDung ?? "",
        gioiTinh: row.gioiTinh ?? "",
        ngaySinh:  row.ngaySinh ? toDateInput(row.ngaySinh) : "",
        email: row.email ?? "",
        soDienThoai: row.soDienThoai ?? "",
        vaiTro: row.vaiTro as VaiTro,
    });
    };
    const validateEdit = () => {
        if (!editForm.hoTen.trim())      return toast.error("Họ tên không được để trống"), false;
        if (!editForm.maNguoiDung.trim())return toast.error("Mã người dùng không được để trống"), false;
        if (!editForm.ngaySinh)          return toast.error("Ngày sinh không được để trống"), false;
        if (!editForm.email.trim())      return toast.error("Email không được để trống"), false;
        if (!emailRe.test(editForm.email.trim())) return toast.error("Email không hợp lệ"), false;
        if (!editForm.soDienThoai.trim()) return toast.error("Số điện thoại không được để trống"), false;
        if (!phone10.test(editForm.soDienThoai.trim())) return toast.error("Số điện thoại phải đúng 10 số"), false;
        if (!editForm.vaiTro)            return toast.error("Vai trò không được để trống"), false;
        return true;
    };  
    const cancelEdit = () => {
    setEditRowId(null);
    };
    const handleUpdateSave = async () => {
  if (!validateEdit() || editRowId == null) return;

  const payload = {
    ...editForm,
    email: editForm.email.trim().toLowerCase(),
  };
  const { vaiTro, ...duLieuUpdate } = payload;

  const res = await AdminApi.updateNguoiDung(editRowId, duLieuUpdate);
  if (res?.ok !== false) {
    const updated = res.data ?? res; // tuỳ API trả
    // cập nhật lại mảng tại chỗ
    setDanhSachNd((prev) =>
      prev.map((u) => (u.id === editRowId ? { ...u, ...updated } : u))
    );
    toast.success("Cập nhật thành công");
    setEditRowId(null);
  } else {
    const err: any = res.error;
    const msg = err.response?.data?.message || err.message || "Cập nhật thất bại";
    toast.error(msg);
  }
    };

    // thay đổi field khi edit
    const onEditChange = (name: string, value: string) => {
    setEditForm((f) => ({ ...f, [name]: value }));
    };

    //Phần tạo
    const openCreateRow = () => {
    setEditRowId(null);
    setForm({
      hoTen: "",
      maNguoiDung: "",
      gioiTinh: "",
      ngaySinh: "",
      email: "",
      soDienThoai: "",
      vaiTro: "" as any,
    });

    setShowCreateRow(true);
     };
    const cancelCreate = () => {
    setShowCreateRow(false);
    };

    const validate = () => {
    const e: Record<string, string> = {};
    if (!form.hoTen.trim()){
        toast.error("Họ tên không được để trống");
        return false
    } 
    if (!form.maNguoiDung.trim()){
        toast.error("Mã người dùng không được để trống");
        return false
    }
    if (!form.ngaySinh){
        toast.error("Ngày sinh không được để trống");
        return false
    } 
    if (!form.email.trim()) {
        toast.error("Email không được để trống");
        return false
    } else if (!emailRe.test(form.email.trim())) {
        toast.error("Email không hợp lệ");
        return false
    }
    if (!form.soDienThoai.trim()) {
        toast.error("Số điện thoại không được để trống");
        return false
    } else if (!phone10.test(form.soDienThoai.trim())) {
        toast.error("Số điện thoại phải đúng 10 số");
        return false
    }
    if (!form.vaiTro) {
        toast.error("Vai trò không được để trống");
        return false
    }
    return true
    };
    const handleSave = async () => {
    if (!validate()) return;
    const payload = {
      ...form,
      email: form.email.trim().toLowerCase(),
    };
    const res = await AdminApi.taoNguoiDung(payload);
    if (res?.ok !== false) {
        const newUser = res.data;
        setShowCreateRow(false);
        setDanhSachNd((prev) => [newUser, ...prev]);
        setTotal(total + 1);
        toast.success("Tạo người dùng thành công");
    } else {
        const err: any = res.error;
        const mess = err.response?.data?.message
      toast.error(mess);
    }
  };

    const onChange = (name: string, value: string) => {
    setForm((f) => ({ ...f, [name]: value }));
  };


    //Phần delete
    const handleClickDelete = (nguoiDung : any) => {
        setSelectedUser(nguoiDung);
        setConfirmOpen(true);
    };
    const handleConfirmDelete = async () => {
        const result = await AdminApi.xoaNguoiDung(selectedUser.id);
            if(result.ok){
                toast.success("Xóa người dùng thành công");
                setDanhSachNd(danhSachNd.filter((nguoiDung: any) => nguoiDung.id !== selectedUser.id))
                setTotal(total -1);
            }else{
                toast.error("Xóa người dùng thất bại");
             }
        setConfirmOpen(false);
        setSelectedUser(null);
    };
    const handleCloseConfirm = () => {
        setConfirmOpen(false);
        setSelectedUser(null);
    };


    useEffect(() =>{
        const fetchData = async () => {
            const result = await AdminApi.layTatCaNguoiDung(currentPage, 10,search);
            setDanhSachNd(result.data.data)
            setTotal(result.data.total)
            setCurrentPage(result.data.currentPage)
        };
        fetchData();
    },[currentPage,search]);


    return (
        <Box 
        sx={{
        width: "100%",
        maxWidth: "95%",         // panel rộng tối đa
        minHeight: "95%",         // hoặc '70vh' tuỳ bạn
        bgcolor: "#fffcfcff",
        borderRadius: 2,
        boxShadow: 3,

      }}>
        <Stack direction="column" spacing={10} sx={{p: 10}}>

            <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
                <Typography variant="h6" sx={{fontWeight: 'bold'}}>
                    Danh Sách Người Dùng
                </Typography>
                <Stack direction="row" spacing={2}>
                    <TextField label="Tìm kiếm tên người dùng" variant="outlined" size="small" value={search} onChange={(e) => setSearch(e.target.value)}/>
                    <Button variant="contained" color="primary"  onClick={openCreateRow}>Tạo mới người dùng</Button>
                </Stack>
            </Stack>

            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Họ và tên</TableCell>
                        <TableCell>Mã người dùng</TableCell>
                        <TableCell>Giới tính</TableCell>
                        <TableCell>Ngày sinh</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Số điện thoại</TableCell>
                        <TableCell>Vai trò</TableCell>
                        <TableCell>Chức năng</TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {showCreateRow && (
                    <TableRow style={{alignItems: "center", justifyContent: "center"}} >
                        <TableCell padding="none">
                        <TextField size="small" value={form.hoTen} placeholder="Họ tên"
                            style={{paddingLeft: "10px"}}
                            variant="standard"
                            sx={{ width: 160, height: 40 }}
                            onChange={(e) => onChange("hoTen", e.target.value)} 
                            
                            />
                        </TableCell>

                        <TableCell padding="none" >
                        <TextField size="small" value={form.maNguoiDung} placeholder="Mã"
                            style={{paddingLeft: "20px"}}
                            variant="standard"
                            sx={{ width: 110, height: 40 }}
                            onChange={(e) => onChange("maNguoiDung", e.target.value)} />
                        </TableCell>

                        {/* ✅ Cbx Giới tính */}
                        <TableCell padding="none">
                        <TextField
                            variant="standard"
                            select
                            size="small"
                            value={form.gioiTinh}
                            onChange={(e) => onChange("gioiTinh", e.target.value)}
                            sx={{ width: 90, height: 40 }}
                        >
                            <MenuItem value="nam">Nam</MenuItem>
                            <MenuItem value="nữ">Nữ</MenuItem>
                        </TextField>
                        </TableCell>

                        <TableCell padding="none">
                        <TextField size="medium" type="date" value={form.ngaySinh}
                            style={{paddingLeft: "10px"}}
                            variant="standard"
                            sx={{ width: 120, height: 40 }}
                            onChange={(e) => onChange("ngaySinh", e.target.value)}
                        />
                        </TableCell>

                        <TableCell padding="none">
                        <TextField size="small" value={form.email} placeholder="Email"
                            style={{paddingLeft: "12px"}}
                            variant="standard"
                            sx={{ width: 200, height: 40 }}
                            onChange={(e) => onChange("email", e.target.value)} />
                        </TableCell>

                        <TableCell padding="none">
                        <TextField size="small" value={form.soDienThoai} placeholder="SĐT"
                             style={{paddingLeft: "10px"}}
                            variant="standard"
                            sx={{ width: 100, height: 40 }}
                            onChange={(e) => onChange("soDienThoai", e.target.value)}
                        />
                        </TableCell>

                        <TableCell padding="none">
                        <TextField select size="small" value={form.vaiTro}
                            variant="standard"
                            onChange={(e) => onChange("vaiTro", e.target.value)}
                            sx={{ width: 120, height: 40 }}
                        >
                            <MenuItem value="GiaoVien">Giảng viên</MenuItem>
                            <MenuItem value="SinhVien">Sinh viên</MenuItem>
                        </TextField>
                        </TableCell>

                        <TableCell padding="none" sx={{ px: 1 }} style={{paddingLeft: "10px"}}>
                        <Stack direction="row" spacing={5}>
                            <a   style={{ color: "#1976d2", cursor: "pointer", textDecoration: "none" }} onClick={handleSave}>Lưu</a>
                            <a style={{ color: "#d32f2f", cursor: "pointer", textDecoration: "none" }} onClick={() => cancelCreate()}>Hủy</a>
                        </Stack>
                        </TableCell>
                    </TableRow>
                    )}



                    
                    {danhSachNd.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} align="center">
                                Không có người dùng nào.
                            </TableCell>
                        </TableRow>
                    ) : (
                        danhSachNd.map((row: any) => (
                        <TableRow key={row.id}>
                            {editRowId === row.id ? (
                            <>
                                <TableCell padding="none">
                                <TextField
                                    size="small"
                                    variant="standard"
                                    sx={{ width: 160, height: 40 }}
                                    value={editForm.hoTen}
                                    onChange={(e) => onEditChange("hoTen", e.target.value)}
                                />
                                </TableCell>

                                <TableCell padding="none">
                                <TextField
                                    size="small"
                                    variant="standard"
                                    sx={{ width: 110, height: 40 }}
                                    value={editForm.maNguoiDung}
                                    onChange={(e) => onEditChange("maNguoiDung", e.target.value)}
                                />
                                </TableCell>

                                <TableCell padding="none">
                                <TextField
                                    select
                                    size="small"
                                    variant="standard"
                                    sx={{ width: 90, height: 40 }}
                                    value={editForm.gioiTinh}
                                    onChange={(e) => onEditChange("gioiTinh", e.target.value)}
                                >
                                    <MenuItem value="nam">Nam</MenuItem>
                                    <MenuItem value="nữ">Nữ</MenuItem>
                                </TextField>
                                </TableCell>

                                <TableCell padding="none">
                                <TextField
                                    type="date"
                                    size="small"
                                    variant="standard"
                                    sx={{ width: 120, height: 40 }}
                                    value={(editForm.ngaySinh)}
                                    onChange={(e) => onEditChange("ngaySinh", e.target.value)}
                                />
                                </TableCell>

                                <TableCell padding="none">
                                <TextField
                                    size="small"
                                    variant="standard"
                                    sx={{ width: 200, height: 40 }}
                                    value={editForm.email}
                                    onChange={(e) => onEditChange("email", e.target.value)}
                                />
                                </TableCell>

                                <TableCell padding="none">
                                <TextField
                                    size="small"
                                    variant="standard"
                                    sx={{ width: 100, height: 40 }}
                                    value={editForm.soDienThoai}
                                    onChange={(e) => onEditChange("soDienThoai", e.target.value)}
                                    inputProps={{ maxLength: 10 }}
                                />
                                </TableCell>

                                <TableCell padding="none">
                                <TextField
                                    disabled
                                    select
                                    size="small"
                                    variant="standard"
                                    sx={{ width: 120, height: 40 }}
                                    value={editForm.vaiTro}
                                    onChange={(e) => onEditChange("vaiTro", e.target.value)}
                                >
                                    <MenuItem value="GiaoVien">Giảng viên</MenuItem>
                                    <MenuItem value="SinhVien">Sinh viên</MenuItem>
                                </TextField>
                                </TableCell>

                                <TableCell padding="none">
                                <Stack direction="row" spacing={5} sx={{ pl: 1 }}>
                                    <a style={{ color: "#1976d2", cursor: "pointer", textDecoration: "none" }}
                                    onClick={handleUpdateSave}>Lưu</a>
                                    <a style={{ color: "#d32f2f", cursor: "pointer", textDecoration: "none" }}
                                    onClick={cancelEdit}>Hủy</a>
                                </Stack>
                                </TableCell>
                            </>
                            ) : (
                            <>
                                <TableCell>{row.hoTen}</TableCell>
                                <TableCell>{row.maNguoiDung}</TableCell>
                                <TableCell>{row.gioiTinh}</TableCell>
                                <TableCell>{toDateDisplay(row.ngaySinh)}</TableCell>
                                <TableCell>{row.email}</TableCell>
                                <TableCell>{row.soDienThoai}</TableCell>
                                <TableCell>{row.vaiTro === "GiaoVien" ? "Giảng viên" : "Sinh Viên"}</TableCell>
                                <TableCell>
                                <Stack direction="row" spacing={5}>
                                    <a
                                    style={{ color: "#1976d2", cursor: "pointer", textDecoration: "none" }}
                                    onClick={() => handleClickEdit(row)}
                                    >
                                    Sửa
                                    </a>
                                    <a
                                    style={{ color: "#d32f2f", cursor: "pointer", textDecoration: "none" }}
                                    onClick={() => handleClickDelete(row)}
                                    >
                                    Xóa
                                    </a>
                                </Stack>
                                </TableCell>
                            </>
                            )}
                        </TableRow>
                        ))

                    )}

                </TableBody>
                <TablePagination
                    component="div"
                    count={total}
                    page={currentPage - 1}
                    onPageChange={(_, newPage) => setCurrentPage(newPage + 1)}
                    rowsPerPage={10}
                    rowsPerPageOptions={[]}
                />
            </Table>
        </Stack>
        <ConfirmDialog
            open={confirmOpen}
            title="Xóa người dùng"
            message={`Bạn có chắc muốn xóa người dùng ${selectedUser?.hoTen} không?`}
            confirmText="Xóa"
            cancelText="Hủy"
            onClose={handleCloseConfirm}
            onConfirm={handleConfirmDelete}
            />


        </Box>
        );
    
}
export default QuanLyNguoiDung;
import { Box, Button, Stack, Table, TableBody, TableCell, TableFooter, TableHead, TablePagination, TableRow, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { AdminApi } from "../../../services/admin.api";
import ConfirmDialog from "../../../common/dialog";
import { toast } from "react-toastify";


const QuanLyMonHoc = () => {
    const [search, setSearch] = useState("");
    const [danhSachMonHoc, setDanhSachMonHoc] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedMonHoc, setSelectedMonHoc] = useState<any>(null);
    const [editRowId, setEditRowId] = useState<number | null>(null);
    const [showCreateRow, setShowCreateRow] = useState(false);
    const [sxTenMonHoc, setSxTenMonHoc] = useState<boolean>(false);
    const [form, setForm] = useState({
        maMonHoc:"",
        tenMonHoc:""
    });
    const [editForm, setEditForm] = useState({
        maMonHoc:"",
        tenMonHoc:""
    });

    //Phân sửa
    const validateEdit = () => {
        if (!editForm.maMonHoc.trim()){
            toast.error("Mã môn học không được để trống");
            return false
        } 
        if (!editForm.tenMonHoc.trim()){
            toast.error("Tên môn học không được để trống");
            return false
        }
        return true
    };
    const handleClickEdit = (monHoc: any) => {
        setShowCreateRow(false);
    
        setEditRowId(monHoc.id);
        setEditForm({
            maMonHoc: monHoc.maMonHoc,
            tenMonHoc: monHoc.tenMonHoc
        });
    };
    const cancelEdit = () => {
    setEditRowId(null);
    };
    const onEditChange = (name: string, value: string) => {
    setEditForm((f) => ({ ...f, [name]: value }));
    };
    const handleUpdateSave = async () => {
        if (!validateEdit() || editRowId == null) return;

    const res = await AdminApi.updateMonHoc(editRowId, editForm);
    if (res?.ok !== false) {
        const updated = res.data ?? res;
        // cập nhật lại mảng tại chỗ
        setDanhSachMonHoc((prev) =>
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



    //Phần Tạo
    const validate = () => {
        if (!form.maMonHoc.trim()){
            toast.error("Mã môn học không được để trống");
            return false
        } 
        if (!form.tenMonHoc.trim()){
            toast.error("Tên môn học không được để trống");
            return false
        }
        return true
    };
    const openCreateRow = () => {
    setEditRowId(null);
    setForm({
        maMonHoc: "",
        tenMonHoc: ""
    });
    setShowCreateRow(true);
    };
    const onChange = (name: string, value: string) => {
        setForm((f) => ({ ...f, [name]: value }));
    };
    const cancelCreate = () => {
        setShowCreateRow(false);
    };
    const handleSave = async () => {
        if (!validate()) return;
        const res = await AdminApi.taoMonHoc(form);
        if (res?.ok !== false) {
            const newMonHoc = res.data;
            setShowCreateRow(false);
            fetchData();
            toast.success("Tạo môn học thành công");
        } else {
            const err: any = res.error;
            const mess = err.response?.data?.message
            toast.error(mess);
        }
    };

    //Phần xóa
    const handleClickDelete = (monHoc : any) => {
        setSelectedMonHoc(monHoc);
        setConfirmOpen(true);
    };
    const handleCloseConfirm = () => {
        setConfirmOpen(false);
        setSelectedMonHoc(null);
    };
    const handleConfirmDelete = async () => {
        const result = await AdminApi.xoaMonHoc(selectedMonHoc.id);
            if(result.ok){
                toast.success("Xóa môn học thành công");
                setDanhSachMonHoc(danhSachMonHoc.filter((monHoc: any) => monHoc.id !== selectedMonHoc.id))
                setTotal(total -1);
            }else{
                toast.error("Xóa môn học thất bại");
             }
        setConfirmOpen(false);
        setSelectedMonHoc(null);
    };
    const fetchData = async () =>{
            const result = await AdminApi.layTatCaMonHoc(currentPage,10, search, sxTenMonHoc);
            setDanhSachMonHoc(result.data.data)
            setTotal(result.data.total)
            setCurrentPage(result.data.currentPage)
        }

    useEffect (() =>{
        fetchData()
    },[currentPage, search, sxTenMonHoc]);

    return (
        <Box 
        sx={{
        width: "100%",
        maxWidth: "95%",        
        minHeight: "95%",        
        bgcolor: "#fffcfcff",
        borderRadius: 2,
        boxShadow: 3,

      }}>
         <Stack direction="column" spacing={10} sx={{p: 10}}>

            <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
                <Typography variant="h6" sx={{fontWeight: 'bold'}}>
                    Danh Sách môn học
                </Typography>
                <Stack direction="row" spacing={2}>
                    <TextField label="Tìm kiếm tên môn học" variant="outlined" size="small" value={search} onChange={(e) => setSearch(e.target.value)}/>
                    <Button variant="contained" color="primary"  onClick={openCreateRow} >Tạo mới môn học</Button>
                </Stack>
            </Stack>

                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell> Mã môn học</TableCell>
                            <TableCell onClick={() => {setSxTenMonHoc(!sxTenMonHoc); fetchData()}}>{sxTenMonHoc ?  "▼" :"▲"} Tên môn học</TableCell>
                            <TableCell>Chức năng</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {showCreateRow && (
                    <TableRow style={{alignItems: "center", justifyContent: "center"}} >
                        <TableCell padding="none">
                        <TextField size="small" value={form.maMonHoc} placeholder="Mã môn học"
                            style={{paddingLeft: "10px"}}
                            variant="standard"
                            sx={{ width: 160, height: 40 }}
                            onChange={(e) => onChange("maMonHoc", e.target.value)} 
                            />
                        </TableCell>

                        <TableCell padding="none" >
                        <TextField size="small" value={form.tenMonHoc} placeholder="Tên môn học"
                            style={{paddingLeft: "20px"}}
                            variant="standard"
                            sx={{ width: 110, height: 40 }}
                            onChange={(e) => onChange("tenMonHoc", e.target.value)} />
                        </TableCell>

                        <TableCell padding="none" sx={{ px: 1 }} style={{paddingLeft: "10px"}}>
                            <Stack direction="row" spacing={5}>
                                <a   style={{ color: "#1976d2", cursor: "pointer", textDecoration: "none" }} onClick={handleSave}>Lưu</a>
                                <a style={{ color: "#d32f2f", cursor: "pointer", textDecoration: "none" }} onClick={() => cancelCreate()}>Hủy</a>
                            </Stack>
                        </TableCell>
                    </TableRow>
                    
                    )}
                        {danhSachMonHoc.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} align="center">
                                Không có người dùng nào.
                            </TableCell>
                        </TableRow>
                    ) : (
                        danhSachMonHoc.map((monHoc: any) => (
                            <TableRow key={monHoc.id}>
                                {editRowId === monHoc.id ? (
                                    <>
                                    <TableCell padding="none">
                                        <TextField
                                            size="small"
                                            variant="standard"
                                            sx={{ width: 200, height: 40 }}
                                            value={editForm.maMonHoc}
                                            onChange={(e) => onEditChange("maMonHoc", e.target.value)}
                                        />
                                        </TableCell>

                                        <TableCell padding="none">
                                        <TextField
                                            size="small"
                                            variant="standard"
                                            sx={{ width: 200, height: 40 }}
                                            value={editForm.tenMonHoc}
                                            onChange={(e) => onEditChange("tenMonHoc", e.target.value)}
                                        />
                                        </TableCell>

                                                                        <TableCell padding="none">
                                        <Stack direction="row" spacing={5} sx={{ pl: 1 }}>
                                            <a style={{ color: "#1976d2", cursor: "pointer", textDecoration: "none" }}
                                            onClick={handleUpdateSave}>Lưu</a>
                                            <a style={{ color: "#d32f2f", cursor: "pointer", textDecoration: "none" }}
                                            onClick={cancelEdit}>Hủy</a>
                                        </Stack>
                                        </TableCell>
                                    </>) : (
                                <>
                                <TableCell>{monHoc.maMonHoc}</TableCell>
                                <TableCell>{monHoc.tenMonHoc}</TableCell>
                                <TableCell >
                                    <Stack direction="row" spacing={5}>
                                    <a
                                    style={{ color: "#1976d2", cursor: "pointer", textDecoration: "none" }}
                                    onClick={() => handleClickEdit(monHoc)}
                                    >
                                    Sửa
                                    </a>
                                    <a
                                    style={{ color: "#d32f2f", cursor: "pointer", textDecoration: "none" }}
                                    onClick={() => handleClickDelete(monHoc)}
                                    >
                                    Xóa
                                    </a>
                                </Stack>
                                </TableCell>
                                </>)}
                            </TableRow>
                        ))
                    )}

                    </TableBody>
                    <TableFooter>
                        <TablePagination
                            component="div"
                            count={total}
                            page={currentPage - 1}
                            onPageChange={(_, newPage) => setCurrentPage(newPage + 1)}
                            rowsPerPage={10}
                            rowsPerPageOptions={[]}
                            labelDisplayedRows={({ page }) => `Trang ${page + 1}`}
                            labelRowsPerPage=""
                            />
                    </TableFooter>
                    
                </Table>
                

        </Stack>

        <ConfirmDialog
                    open={confirmOpen}
                    title="Xóa môn học"
                    message={`Bạn có chắc muốn xóa môn học ${selectedMonHoc?.tenMonHoc} không?`}
                    confirmText="Xóa"
                    cancelText="Hủy"
                    onClose={handleCloseConfirm}
                    onConfirm={handleConfirmDelete}
        />            

      </Box>
    );
};
export default QuanLyMonHoc;
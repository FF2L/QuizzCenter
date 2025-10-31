// src/pages/admin/PhanCongMonHoc.tsx
import {
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  TablePagination,
  MenuItem,
} from "@mui/material";
import { useEffect, useState } from "react";
import { AdminApi } from "../../../services/admin.api";
import { toast } from "react-toastify";
import ConfirmDialog from "../../../common/dialog";

const PhanCongMonHoc = () => {
  const [search, setSearch] = useState("");                // tìm theo tên giảng viên
  const [danhSach, setDanhSach] = useState<any[]>([]);     // list phân công
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [showCreateRow, setShowCreateRow] = useState(false);
  const [dsGiangVien, setDsGiangVien] = useState<any[]>([]);
  const [dsMonHoc, setDsMonHoc] = useState<any[]>([]);

  const [form, setForm] = useState({ idGiangVien: "", idMonHoc: "" });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  // ===== LOAD LIST =====
  const fetchData = async () => {
    const res = await AdminApi.layTatCaMonHocDaPhanCong(currentPage, 10, search);
    if (res?.ok) {
      setDanhSach(res.data?.data ?? []);
      setTotal(res.data?.total ?? 0);
      setCurrentPage(res.data?.currentPage ?? 1);
    } else {
      toast.error("Tải danh sách phân công thất bại");
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, search]);

  // ===== THÊM =====
  const openCreateRow = async () => {
    // Giảng viên (không phân trang)
    const resGV = await AdminApi.layTatCaGiangVienKhongPhanTrang();
    if (resGV?.ok) setDsGiangVien(Array.isArray(resGV.data) ? resGV.data : []);
    else setDsGiangVien([]);

    // Môn học (không query)
    const resMH = await AdminApi.layTatCaMonHocKhongQuery();
    if (resMH?.ok) {
      const arr = Array.isArray(resMH.data) ? resMH.data : resMH.data?.data ?? [];
      setDsMonHoc(arr);
    } else setDsMonHoc([]);

    setForm({ idGiangVien: "", idMonHoc: "" });
    setShowCreateRow(true);
  };

  const onChangeCreate = (name: string, value: string) => {
    setForm((f) => ({ ...f, [name]: value }));
  };

  const cancelCreate = () => {
    setShowCreateRow(false);
  };

  const validateCreate = () => {
    if (!form.idGiangVien) return toast.error("Vui lòng chọn giảng viên"), false;
    if (!form.idMonHoc) return toast.error("Vui lòng chọn môn học"), false;
    return true;
  };

  const handleSave = async () => {
    if (!validateCreate()) return;
    // idGiangVien là idNguoiDung theo API controller của bạn
    const res = await AdminApi.phanCongMonHocChoGiangVien(+form.idGiangVien, +form.idMonHoc);
    if (res?.ok !== false) {
      toast.success("Phân công thành công");
      setShowCreateRow(false);
      fetchData();
      setTotal((t) => t + 1);
    } else {
      const err: any = res?.error;
      const msg = err?.response?.data?.message ?? "Phân công thất bại";
      toast.error(String(msg));
    }
  };

  // ===== XOÁ =====
  const handleClickDelete = (row: any) => {
    setSelectedRow(row);
    setConfirmOpen(true);
  };

  const handleCloseConfirm = () => {
    setConfirmOpen(false);
    setSelectedRow(null);
  };

  const handleConfirmDelete = async () => {
    const idMonHoc = selectedRow?.mh_id; // từ getRawMany()
    // chọn id gửi cho API delete: ưu tiên nd_id (nếu backend cần idNguoiDung)
    const idGiangVienForApi = selectedRow?.gv_idNguoiDung
 
    console.log("selectedRow", selectedRow)

    const res = await AdminApi.xoaPhanCongMonHoc(+idGiangVienForApi, idMonHoc);
    if (res?.ok) {
      toast.success("Xóa phân công thành công");
        fetchData();
    } else {
      const err: any= res?.error;
      const msg = err?.response?.data?.message ?? "Xoá phân công thất bại";
      toast.error(String(msg));
    }
    setConfirmOpen(false);
    setSelectedRow(null);
  };

  // ===== RENDER =====
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "95%",
        minHeight: "95%",
        bgcolor: "#fffcfcff",
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Stack direction="column" spacing={10} sx={{ p: 10 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-end">
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            Phân công môn học cho giảng viên
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Tìm theo tên giảng viên"
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="contained" color="primary" onClick={openCreateRow}>
              Thêm phân công
            </Button>
          </Stack>
        </Stack>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Người dùng (Giảng viên)</TableCell>
              <TableCell>Môn học được phân công</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {/* HÀNG THÊM */}
            {showCreateRow && (
              <TableRow>
                <TableCell padding="none">
                  <TextField
                    variant="standard"
                    select
                    size="small"
                    value={form.idGiangVien}
                    onChange={(e) => onChangeCreate("idGiangVien", e.target.value)}
                    sx={{ width: 280, height: 40, pl: 1 }}
                  >
                    <MenuItem value="">
                      <em>— Chọn giảng viên —</em>
                    </MenuItem>
                    {(dsGiangVien ?? []).map((gv: any) => (
                      <MenuItem key={gv.idNguoiDung} value={gv.idNguoiDung}>
                        {gv.__nguoiDung__?.hoTen ?? `GV #${gv.idNguoiDung}`}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>

                <TableCell padding="none">
                  <TextField
                    variant="standard"
                    select
                    size="small"
                    value={form.idMonHoc}
                    onChange={(e) => onChangeCreate("idMonHoc", e.target.value)}
                    sx={{ width: 280, height: 40 }}
                  >
                    <MenuItem value="">
                      <em>— Chọn môn học —</em>
                    </MenuItem>
                    {(dsMonHoc ?? []).map((mh: any) => (
                      <MenuItem key={mh.id} value={mh.id}>
                        {mh.tenMonHoc}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>

                <TableCell padding="none" sx={{ px: 1 }}>
                  <Stack direction="row" spacing={5}>
                    <a
                      style={{ color: "#1976d2", cursor: "pointer", textDecoration: "none" }}
                      onClick={handleSave}
                    >
                      Lưu
                    </a>
                    <a
                      style={{ color: "#d32f2f", cursor: "pointer", textDecoration: "none" }}
                      onClick={cancelCreate}
                    >
                      Hủy
                    </a>
                  </Stack>
                </TableCell>
              </TableRow>
            )}

            {/* DANH SÁCH */}
            {danhSach.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Chưa có phân công nào.
                </TableCell>
              </TableRow>
            ) : (
              danhSach.map((row: any, idx: number) => (
                <TableRow key={`${row.gv_id ?? row.nd_id}-${row.mh_id}-${idx}`}>
                  <TableCell>{row.nd_hoTen}</TableCell>
                  <TableCell>{row.mh_tenMonHoc}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={5}>
                      <a
                        style={{ color: "#d32f2f", cursor: "pointer", textDecoration: "none" }}
                        onClick={() => handleClickDelete(row)}
                      >
                        Xóa
                      </a>
                    </Stack>
                  </TableCell>
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

        <ConfirmDialog
          open={confirmOpen}
          title="Xóa phân công"
          message={`Bạn có chắc muốn xóa phân công môn "${selectedRow?.mh_tenMonHoc}" của giảng viên "${selectedRow?.nd_hoTen}" không?`}
          confirmText="Xóa"
          cancelText="Hủy"
          onClose={handleCloseConfirm}
          onConfirm={handleConfirmDelete}
        />
      </Stack>
    </Box>
  );
};

export default PhanCongMonHoc;

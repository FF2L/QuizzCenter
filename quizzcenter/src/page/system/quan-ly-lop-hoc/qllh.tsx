import {
  Box,
  Button,
  Stack,
  TableBody,
  Table,
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
import { toDateDisplay } from "../../../common/gobal/gobal.const";
import { toast } from "react-toastify";
import ConfirmDialog from "../../../common/dialog";
import { useNavigate } from "react-router-dom";

const QuanLyLopHoc = () => {
  const [search, setSearch] = useState("");
  const [danhSachLopHoc, setDanhSachLopHoc] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [showCreateRow, setShowCreateRow] = useState(false);
  const [editRowId, setEditRowId] = useState<number | null>(null);

  const [danhSachMonHoc, setDanhSachMonHoc] = useState<any[]>([]);
  const [danhSachGiangVien, setDanhSachGiangVien] = useState<any[]>([]);
  const [danhSachHocKy, setDanhSachHocKy] = useState<any[]>([]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedLop, setSelectedLop] = useState<any>(null);

  const navigate = useNavigate();

  // ----- FORM TẠO -----
  const [form, setForm] = useState({
    tenLopHoc: "",
    hocKy: "",
    idMonHoc: "",
    idGiangVien: "",
  });

  // ----- FORM SỬA -----
  const [editForm, setEditForm] = useState({
    tenLopHoc: "",
    hocKy: "",
    idMonHoc: "",
    idGiangVien: "",
  });

  // ================== LOAD LIST ==================
  const fetchData = async () => {
    const result = await AdminApi.layTatCaLopHocPhan(currentPage, 10, search);
    const resHocKy = await AdminApi.layTatCaHocKyDangDienRa();
    if (resHocKy.ok) {
      setDanhSachHocKy(resHocKy.data ?? []);
    } else {
      setDanhSachHocKy([]);
    }
    if (result.ok) {
      setDanhSachLopHoc(result.data.data);
      setTotal(result.data.total);
      setCurrentPage(result.data.currentPage);
    } else {
      setDanhSachLopHoc([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, search]);

  // ================== TẠO ==================
  const validateCreate = () => {
    if (!form.tenLopHoc.trim()) return toast.error("Tên lớp học không được để trống"), false;
    if (!form.hocKy) return toast.error("Học kỳ không được để trống"), false;
    if (!form.idMonHoc) return toast.error("Môn học không được để trống"), false;
    if (!form.idGiangVien) return toast.error("Giảng viên không được để trống"), false;

    return true;
  };

  const openCreateRow = async () => {
    const resMon = await AdminApi.layTatCaMonHocKhongQuery();
    if (resMon?.ok) {
      const arr = Array.isArray(resMon.data) ? resMon.data : resMon.data?.data ?? [];
      setDanhSachMonHoc(arr);
    } else {
      setDanhSachMonHoc([]);
    }

    setEditRowId(null);
    setForm({
      tenLopHoc: "",
      hocKy: "",
      idMonHoc: "",
      idGiangVien: "",
    });
    setDanhSachGiangVien([]);
    setShowCreateRow(true);
  };

  const onChangeCreate = async (name: string, value: string) => {
    setForm((f) => ({ ...f, [name]: value }));
    if (name === "idMonHoc") {
      setForm((f) => ({ ...f, idGiangVien: "" }));
      if (value) {
        const result = await AdminApi.layTatCaGiangVienTheoIdMonHoc(+value);
        if (result.ok) setDanhSachGiangVien(result.data ?? []);
        else setDanhSachGiangVien([]);
      } else {
        setDanhSachGiangVien([]);
      }
    }
  };

  const cancelCreate = () => {
    setShowCreateRow(false);
    setDanhSachGiangVien([]);

  };

  const handleSave = async () => {
    if (!validateCreate()) return;
    const payload = {
      ...form,
      idMonHoc: +form.idMonHoc,
      idGiangVien: +form.idGiangVien,
    };
    const res = await AdminApi.taoLopHocPhan(payload);
    if (res?.ok !== false) {
      toast.success("Tạo lớp học thành công");
      setShowCreateRow(false);
      fetchData();
      setTotal((t) => t + 1);
    } else {
      console.log(res);
      const err: any = res?.error;
      const mess = err?.response?.data?.message ?? "Tạo lớp học thất bại";
      toast.error(mess);
    }
  };

  // ================== SỬA ==================
const handleClickEdit = async (row: any) => {
  // nạp danh sách môn học nếu chưa có
  if (!danhSachMonHoc.length) {
    const resMon = await AdminApi.layTatCaMonHocKhongQuery();
    if (resMon?.ok) {
      const arr = Array.isArray(resMon.data) ? resMon.data : resMon.data?.data ?? [];
      setDanhSachMonHoc(arr);
    } else {
      setDanhSachMonHoc([]);
    }
  }

  const idMH = row.mh_id ?? row.idMonHoc ?? row.idmonhoc ?? "";

  // nạp giảng viên theo môn hiện tại
  if (idMH) {
    const resGV = await AdminApi.layTatCaGiangVienTheoIdMonHoc(+idMH);
    if (resGV?.ok) setDanhSachGiangVien(resGV.data ?? []);
    else setDanhSachGiangVien([]);
  } else {
    setDanhSachGiangVien([]);
  }

  // 🔥 row chỉ có tên học kỳ (hocky), nên phải map ngược lại sang id
  const hkMatch = danhSachHocKy.find(
    (hk: any) => hk.tenHocKy === (row.hocky ?? row.hocKy)
  );

  setEditRowId(row.lhp_id ?? row.id);

  setEditForm({
    tenLopHoc: row.tenlhp ?? row.tenLopHoc ?? "",
    hocKy: hkMatch ? String(hkMatch.id) : "",        // 👈 value = id của học kỳ
    idMonHoc: String(idMH ?? ""),
    idGiangVien: String(row.nd_id ?? row.idgiangvien ?? row.idGiangVien ?? ""),
  });

  setShowCreateRow(false);
};



  const onEditChange = async (name: string, value: string) => {
    setEditForm((f) => ({ ...f, [name]: value }));
    if (name === "idMonHoc") {
      setEditForm((f) => ({ ...f, idGiangVien: "" }));
      if (value) {
        const resGV = await AdminApi.layTatCaGiangVienTheoIdMonHoc(+value);
        if (resGV?.ok) setDanhSachGiangVien(resGV.data ?? []);
        else setDanhSachGiangVien([]);
      } else {
        setDanhSachGiangVien([]);
      }
    }
  };

  const validateEdit = () => {
    if (!editForm.tenLopHoc.trim()) return toast.error("Tên lớp học không được để trống"), false;
    if (!editForm.hocKy) return toast.error("Học kỳ không được để trống"), false;
    if (!editForm.idMonHoc) return toast.error("Môn học không được để trống"), false;
    if (!editForm.idGiangVien) return toast.error("Giảng viên không được để trống"), false;
    return true;
  };

  const cancelEdit = () => {
    setEditRowId(null);
  };

  const handleUpdateSave = async () => {
    if (!validateEdit() || editRowId == null) return;

    const payload = {
      tenLopHoc: editForm.tenLopHoc,
      hocKy: editForm.hocKy,
      idMonHoc: +editForm.idMonHoc,
      idGiangVien: +editForm.idGiangVien,
    };

    const res = await AdminApi.updateLopHocPhan(editRowId, payload);
    if (res?.ok !== false) {
      const updated = res.data;

    fetchData()
      toast.success("Cập nhật lớp học thành công");
      cancelEdit();
    } else {
        const err: any = res?.error;
      const msg = err?.response?.data?.message ?? err?.message ?? "Cập nhật thất bại";
      toast.error(String(msg));
    }
  };

  // ================== XOÁ ==================
  const handleClickDelete = (row: any) => {
    setSelectedLop(row);
    setConfirmOpen(true);
  };
  const handleCloseConfirm = () => {
    setConfirmOpen(false);
    setSelectedLop(null);
  };
  const handleConfirmDelete = async () => {
    const result = await AdminApi.xoaLopHocPhan(selectedLop.lhp_id);
    if (result.ok) {
      toast.success("Xóa lớp học thành công");
      setDanhSachLopHoc((prev) => prev.filter((x: any) => x.lhp_id !== selectedLop.lhp_id));
      setTotal((t) => t - 1);
    } else {
      const err: any = result?.error;
      const msg = err?.response?.data?.message ?? "Xóa lớp học thất bại";
      toast.error(msg);
    }
    setConfirmOpen(false);
    setSelectedLop(null);
  };

  // ================== RENDER ==================
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
            Danh Sách Lớp Học
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Tìm kiếm tên lớp học phần"
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="contained" color="primary" onClick={openCreateRow}>
              Tạo mới lớp học phần
            </Button>
          </Stack>
        </Stack>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên lớp học</TableCell>
              <TableCell>Học kỳ</TableCell>
              <TableCell>Môn học</TableCell>
              <TableCell>Giảng viên</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {/* HÀNG TẠO */}
            {showCreateRow && (
              <TableRow style={{ alignItems: "center", justifyContent: "center" }}>

                <TableCell padding="none">
                  <TextField
                    size="small"
                    value={form.tenLopHoc}
                    placeholder="Tên lớp học"
                    variant="standard"
                    sx={{ width: 200, height: 40 }}
                    onChange={(e) => onChangeCreate("tenLopHoc", e.target.value)}
                  />
                </TableCell>

                <TableCell padding="none">
                  <TextField
                    variant="standard"
                    select
                    size="small"
                    value={form.hocKy}
                    onChange={(e) => onChangeCreate("hocKy", e.target.value)}
                    sx={{ width: 200, height: 40 }}
                  >
                    {(danhSachHocKy ?? []).map((hk: any) => (
                      <MenuItem key={hk.id} value={hk.id}>
                        {hk.tenHocKy}
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
                    sx={{ width: 200, height: 40 }}
                  >
                    {(danhSachMonHoc ?? []).map((monHoc: any) => (
                      <MenuItem key={monHoc.id} value={monHoc.id}>
                        {monHoc.tenMonHoc ?? monHoc.ten}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>

                <TableCell padding="none">
                  <TextField
                    variant="standard"
                    select
                    size="small"
                    value={form.idGiangVien}
                    onChange={(e) => onChangeCreate("idGiangVien", e.target.value)}
                    sx={{ width: 200, height: 40 }}
                    disabled={(danhSachGiangVien ?? []).length === 0}
                  >
                    {(danhSachGiangVien ?? []).map((giangVien: any) => (
                      <MenuItem key={giangVien.idnguoidung} value={giangVien.idnguoidung}>
                        {giangVien.hoten}
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

            {/* DANH SÁCH + SỬA INLINE */}
            {danhSachLopHoc.map((lopHoc: any) => (
              <TableRow key={lopHoc.lhp_id}>
                {editRowId === lopHoc.lhp_id ? (
                  <>
                    <TableCell padding="none">
                      <TextField
                        size="small"
                        variant="standard"
                        sx={{ width: 200, height: 40 }}
                        value={editForm.tenLopHoc}
                        onChange={(e) => onEditChange("tenLopHoc", e.target.value)}
                      />
                    </TableCell>

                    <TableCell padding="none">
                      <TextField
                        select
                        size="small"
                        variant="standard"
                        sx={{ width: 200, height: 40 }}
                        value={editForm.hocKy}
                        onChange={(e) => onEditChange("hocKy", e.target.value)}
                      >
                        {danhSachHocKy.map((hk: any) => (
                          <MenuItem key={hk.id} value={hk.id}>
                            {hk.tenHocKy}
                          </MenuItem>
                        ))}
                      </TextField>

                    </TableCell>


                    <TableCell padding="none">
                      <TextField
                        select
                        size="small"
                        variant="standard"
                        sx={{ width: 200, height: 40 }}
                        value={editForm.idMonHoc}
                        onChange={(e) => onEditChange("idMonHoc", e.target.value)}
                      >
                        {(danhSachMonHoc ?? []).map((mh: any) => (
                          <MenuItem key={mh.id} value={mh.id}>
                            {mh.tenMonHoc ?? mh.ten}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>

                    <TableCell padding="none">
                      <TextField
                        select
                        size="small"
                        variant="standard"
                        sx={{ width: 200, height: 40 }}
                        value={editForm.idGiangVien}
                        onChange={(e) => onEditChange("idGiangVien", e.target.value)}
                        disabled={(danhSachGiangVien ?? []).length === 0}
                      >
                        {(danhSachGiangVien ?? []).map((gv: any) => (
                          <MenuItem key={gv.idnguoidung ?? gv.id} value={gv.idnguoidung ?? gv.id}>
                            {gv.hoten ?? gv.hoTen ?? `GV #${gv.id}`}
                          </MenuItem>
                        ))}
                      </TextField>
                    </TableCell>

                    <TableCell>
                      <Stack direction="row" spacing={5}>
                        <a
                          style={{ color: "#1976d2", cursor: "pointer", textDecoration: "none" }}
                          onClick={handleUpdateSave}
                        >
                          Lưu
                        </a>
                        <a
                          style={{ color: "#d32f2f", cursor: "pointer", textDecoration: "none" }}
                          onClick={cancelEdit}
                        >
                          Hủy
                        </a>
                      </Stack>
                    </TableCell>
                  </>
                ) : (
                  <>
                    <TableCell
                    >
                      {lopHoc.tenlhp ?? lopHoc.tenLopHoc}
                    </TableCell>
                    <TableCell>{lopHoc.hocky ?? lopHoc.hocKy}</TableCell>

                    <TableCell>{lopHoc.tenmonhoc ?? lopHoc.tenMonHoc}</TableCell>
                    <TableCell>{lopHoc.tengiangvien ?? lopHoc.tenGiangVien}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={5}>
                        <a
                          style={{ color: "#1976d2", cursor: "pointer", textDecoration: "none" }}
                          onClick={() => handleClickEdit(lopHoc)}
                        >
                          Sửa
                        </a>
                        <a
                          style={{ color: "#d32f2f", cursor: "pointer", textDecoration: "none" }}
                          onClick={() => handleClickDelete(lopHoc)}
                        >
                          Xóa
                        </a>

                        <a style={{ color: "green", cursor: "pointer", textDecoration: "none" }}
                        onClick={() => navigate(`/admin/tsvlh/${lopHoc.lhp_id}`,
                        {
                          state: {
                            tenLopHoc: lopHoc.tenlhp ?? lopHoc.tenLopHoc,
                            tenMonHoc: lopHoc.tenmonhoc ?? lopHoc.tenMonHoc
                          }
                        }
                      )}
                      >Xem chi tiết lớp học</a>
                      </Stack>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
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
          title="Xóa lớp học"
          message={`Bạn có chắc muốn xóa lớp học ${selectedLop?.tenlhp ?? selectedLop?.tenLopHoc} không?`}
          confirmText="Xóa"
          cancelText="Hủy"
          onClose={handleCloseConfirm}
          onConfirm={handleConfirmDelete}
        />
      </Stack>
    </Box>
  );
};

export default QuanLyLopHoc;

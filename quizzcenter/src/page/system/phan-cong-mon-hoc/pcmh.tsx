import {
  Box, Button, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Typography, TablePagination,
  MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
  Checkbox, FormControlLabel, FormGroup
} from "@mui/material";

import { useEffect, useState } from "react";
import { AdminApi } from "../../../services/admin.api";
import { toast } from "react-toastify";


const PhanCongMonHoc = () => {
const [search, setSearch] = useState("");                
const [danhSach, setDanhSach] = useState<any[]>([]);     
const [total, setTotal] = useState(0);
const [currentPage, setCurrentPage] = useState(1);

const [dsMonHoc, setDsMonHoc] = useState<any[]>([]);

const [openEditDialog, setOpenEditDialog] = useState(false);
const [editingGV, setEditingGV] = useState<any>(null);
const [selectedMonHocIds, setSelectedMonHocIds] = useState<number[]>([]);
const [initialMonHocIds, setInitialMonHocIds] = useState<number[]>([]);


  const [form, setForm] = useState({ idGiangVien: "", idMonHoc: "" });


  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [sxTenGiangVien,setSxTenGiangVien] =useState<boolean>(false)

  // ===== LOAD LIST =====
  const fetchData = async () => {
    const res = await AdminApi.layTatCaMonHocDaPhanCong(currentPage, 10, search, sxTenGiangVien);
    if (res?.ok) {
      setDanhSach(res.data?.danhSach ?? []);
      console.log("danhSach", res.data?.danhSach);
      setTotal(res.data?.total ?? 0);
      setCurrentPage(res.data?.currentPage ?? 1);
    } else {
      toast.error("Tải danh sách phân công thất bại");
    }
  };

    const fetchMonHoc = async () => {
    const resMH = await AdminApi.layTatCaMonHocKhongQuery();
    if (resMH?.ok) {
      const arr = Array.isArray(resMH.data) ? resMH.data : resMH.data?.data ?? [];
      setDsMonHoc(arr);
    } else setDsMonHoc([]);
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, search, sxTenGiangVien]);

  useEffect(() => {
  fetchMonHoc();
}, []);

const handleOpenEdit = (row: any) => {
  setEditingGV(row);

  // danhSachMonHoc: từ API, mỗi phần tử có id, tenMonHoc
  const currentIds: number[] =
    row.danhSachMonHoc?.[0].id !== null
      ? row.danhSachMonHoc.map((mh: any) => mh.id)
      : [];

  setInitialMonHocIds(currentIds);
  setSelectedMonHocIds(currentIds); // checkbox ban đầu trùng với phân công hiện tại

  setOpenEditDialog(true);
};
const toggleMonHoc = (idMonHoc: number) => {
  setSelectedMonHocIds((prev) =>
    prev.includes(idMonHoc)
      ? prev.filter((x) => x !== idMonHoc)
      : [...prev, idMonHoc]
  );
};

const handleSaveEdit = async () => {
  if (!editingGV) return;

  const gvId = editingGV.idnguoiDung

  const toAdd = selectedMonHocIds.filter((id) => !initialMonHocIds.includes(id));
  const toRemove = initialMonHocIds.filter((id) => !selectedMonHocIds.includes(id));

  try {
    await Promise.all([
      ...toAdd.map((idMonHoc) =>
        AdminApi.phanCongMonHocChoGiangVien(gvId, idMonHoc)
      ),
      ...toRemove.map((idMonHoc) =>
        AdminApi.xoaPhanCongMonHoc(gvId, idMonHoc)
      ),
    ]);

    toast.success("Cập nhật phân công thành công");
    setOpenEditDialog(false);
    setEditingGV(null);
    fetchData();
  } catch (err: any) {
    console.error(err);
    const msg =
      err?.response?.data?.message || "Cập nhật phân công thất bại";
    toast.error(String(msg));
  }
};

const handleCancelEdit = () => {
  setOpenEditDialog(false);
  setEditingGV(null);
  setSelectedMonHocIds([]);
  setInitialMonHocIds([]);
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
          </Stack>
        </Stack>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell onClick={() => { setSxTenGiangVien(!sxTenGiangVien); fetchData(); }}>{sxTenGiangVien ? "▲" : "▼"} Giảng viên</TableCell>
              <TableCell>Môn học được phân công</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {/* HÀNG THÊM */}

            {/* DANH SÁCH */}
            {danhSach.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  Chưa có phân công nào.
                </TableCell>
              </TableRow>
            ) : (
              danhSach.map((row: any, idx: number) => (
                <TableRow key={row.idnguoiDung }>
                  <TableCell>{row.hoTen}</TableCell>
                  <TableCell
                    sx={{
                      whiteSpace: "normal",
                      wordBreak: "break-word",
                      maxWidth: 200   
                    }}
                  >
                    {row.danhSachMonHoc?.[0].id !== null?
                    row.danhSachMonHoc.map((mh: any) => mh.tenMonHoc).join(", ")
                    : <Typography variant="body2" color="
                    #9e9e9e">Chưa có môn học nào được phân công</Typography>
                    }
                  </TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={5}>
                      <a
                        style={{ color: "#d32f2f", cursor: "pointer", textDecoration: "none" }}
                         onClick={() => handleOpenEdit(row)}
                      >
                        Sửa phân công
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
              labelDisplayedRows={({ page }) => `Trang ${page + 1}`}
              labelRowsPerPage=""
              />
        </Table>
      </Stack>
      <Dialog
        open={openEditDialog}
        onClose={(event, reason) => {
          // chặn đóng khi click bên ngoài hoặc nhấn ESC
          if (reason === "backdropClick" || reason === "escapeKeyDown") return;
          handleCancelEdit();
        }}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Sửa phân công môn học</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {editingGV && (
            <Stack spacing={2} mt={1}>
              <Typography sx={{ fontWeight: "bold" }}>
                Giảng viên: {editingGV.hoTen}
              </Typography>

              <Typography variant="body2">Chọn các môn được phân công:</Typography>

              <FormGroup>
                {dsMonHoc.map((mh: any) => (
                  <FormControlLabel
                    key={mh.id}
                    control={
                      <Checkbox
                        checked={selectedMonHocIds.includes(mh.id)}
                        onChange={() => toggleMonHoc(mh.id)}
                      />
                    }
                    label={`${mh.maMonHoc} - ${mh.tenMonHoc}`}
                  />
                ))}
              </FormGroup>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEdit}>Hủy</Button>
          <Button variant="contained" onClick={handleSaveEdit}>
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default PhanCongMonHoc;

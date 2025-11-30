// src/pages/admin/PhanCongMonHoc.tsx
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  DialogTitle,
  DialogContent,
  FormControlLabel,
  Checkbox,
  DialogActions,
  Dialog,
} from "@mui/material";
import { useEffect, useState } from "react";
import { AdminApi } from "../../../services/admin.api";
import { toast } from "react-toastify";
import ConfirmDialog from "../../../common/dialog";
import { toDateDisplay, toDateInput } from "../../../common/gobal/gobal.const";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const QuanLyHocKy = () => {
  const [search, setSearch] = useState("");              
  const [danhSach, setDanhSach] = useState<any[]>([]);     

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const [updateOrInsert, setUpdateOrInsert] = useState<"insert" | "update">("insert");

  const [openCreate, setOpenCreate] = useState(false);

  const [createForm, setCreateForm] = useState({
    id: null,
    tenHocKy: "",
    thoiGianBatDau: "",
    thoiGianKetThuc: "",
    phatHanh: false,
  });

  const resetCreateForm = () => {
    setCreateForm({
      id: null,
      tenHocKy: "",
      thoiGianBatDau: "",
      thoiGianKetThuc: "",
      phatHanh: false,
    });
  };

  const updateHocKy = async (id: any) => {
    setUpdateOrInsert("update");
    setOpenCreate(true);
    const res = await AdminApi.layHocKyTheoId(id);
    if (res?.ok) {
      const data = res.data;
      console.log("Fetched hoc ky data:", data);
      setCreateForm({
        id: id,
        tenHocKy: data.tenHocKy,
        thoiGianBatDau: toDateInput(data.thoiGianBatDau),
        thoiGianKetThuc: toDateInput(data.thoiGianKetThuc),
        phatHanh: data.phatHanh,
      });
      console.log("Data hoc ky:", data);
    } else {
      toast.error("Không thể update học kỳ này");
    }
  }


  // ===== LOAD LIST =====
  const fetchData = async () => {
    const res = await AdminApi.layTatCaHocKy(search);
    if (res?.ok) {
      setDanhSach(res.data);
    } else {
      toast.error("Tải danh sách phân công thất bại");
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, updateOrInsert]);

  // ===== Lưu =====
  const handleCreateHocKy = async () => {
    // validate form
    if (!createForm.tenHocKy || !createForm.thoiGianBatDau || !createForm.thoiGianKetThuc) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (updateOrInsert === "insert") {
      const res = await AdminApi.taoHocKy(createForm);
      if (res?.ok) {
        toast.success("Thêm học kỳ thành công");
        fetchData();
        setOpenCreate(false);
        resetCreateForm();
      } else {
        const err: any = res?.error;
        const msg = err?.response?.data?.message ?? "Thêm học kỳ thất bại";
        toast.error(String(msg));
      }
    } else if (updateOrInsert === "update") {
      if (!createForm.id) {
        toast.error("Không thể lấy thông tin học kỳ để cập nhật");
        return;
      }
      const res = await AdminApi.capNhatHocKy(createForm.id, createForm);
      if (res?.ok) {
        toast.success("Cập nhật học kỳ thành công");
        fetchData();
        setOpenCreate(false);
        resetCreateForm();
      } else {
        const err: any = res?.error;
        const msg = err?.response?.data?.message ?? "Cập nhật học kỳ thất bại";
        toast.error(String(msg));
      }
    }
    setUpdateOrInsert("insert");
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

    const res = await AdminApi.xoaHocKy(selectedRow?.id);
    if (res?.ok) {
      toast.success("Xóa học kỳ thành công");
        fetchData();
    } else {
      const err: any= res?.error;
      const msg = err?.response?.data?.message ?? "Xoá học kỳ thất bại";
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
            Quản lý học kỳ
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Tìm theo tên học kỳ"
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="contained" color="primary" onClick={() => {setOpenCreate(true);}}>
              Thêm học kỳ
            </Button>
          </Stack>
        </Stack>

        <Grid container spacing={10}>
        {danhSach.length === 0 ? (
          <Typography>Không có Học kỳ nào</Typography>
        ) : 
            danhSach.map((hk) => (
                          <Grid item xs="auto" key={hk.id}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: 2,
                  height: "100%",
                }}
              >
                <CardContent>
                  <Stack spacing={1}>
                    {/* tiêu đề */}
                    <Typography
                      sx={{ fontWeight: "bold", fontSize: "18px" }}
                      noWrap
                    >
                      {hk.tenHocKy}
                    </Typography>

                    {/* các chip trạng thái giống "Kiểm tra" / "Đã đóng" */}
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label={hk.phatHanh ? "Đã kích hoạt" : "Chưa kích hoạt"}
                        size="small"
                        color={hk.phatHanh ? "primary" : "default"}
                      />
                    </Stack>

                    <Box
                      sx={{
                        mt: 1,
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: "#f7f7f7",
                      }}
                    >
                      <Typography sx={{ fontSize: 14 }}>
                        Thời gian bắt đầu:
                      </Typography>
                      <Typography sx={{ fontWeight: 500, mb: 0.5 }}>
                        {toDateDisplay(hk.thoiGianBatDau)}
                      </Typography>

                      <Typography sx={{ fontSize: 14 }}>
                        Thời gian kết thúc:
                      </Typography>
                      <Typography sx={{ fontWeight: 500, mb: 0.5 }}>
                        {toDateDisplay(hk.thoiGianKetThuc)}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={2} mt={1}>
                      <IconButton
                        size="small"
                        sx={{ 
                          color: "#43A047",
                          "&:hover": { backgroundColor: "#e8f5e9" }
                        }}
                        onClick={() => updateHocKy(hk.id)}
                        title="Chỉnh sửa"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>

                      <IconButton
                      size="small"
                      sx={{ 
                        color: "#e53935",
                        "&:hover": { backgroundColor: "#ffebee" }
                      }}
                      onClick={(e) => {
                        handleClickDelete(hk);
                      }}
                      title="Xóa"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
            )
        )}
        </Grid>

        <Dialog
          open={openCreate}
          onClose={(event, reason) => {
            if (reason === "backdropClick") return;   // chặn đóng khi click bên ngoài
            if (reason === "escapeKeyDown") return;   // chặn đóng khi nhấn ESC
            setOpenCreate(false);                     // chỉ đóng khi gọi đúng nút Hủy
          }}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Thêm học kỳ</DialogTitle>
          <DialogContent sx={{ pt: 1 }}>
            <Stack spacing={2} mt={1}>
              <TextField
                label="Tên học kỳ"
                name="tenHocKy"
                value={createForm.tenHocKy}
                onChange={e => {
                  setCreateForm({
                    ...createForm,
                    tenHocKy: e.target.value,
                  });
                }}
                fullWidth
              />

              <TextField
                label="Thời gian bắt đầu"
                type="date"
                name="thoiGianBatDau"
                value={createForm.thoiGianBatDau}
                onChange={e => {
                  setCreateForm({
                    ...createForm,
                    thoiGianBatDau: e.target.value,
                  });
                }}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />

              <TextField
                label="Thời gian kết thúc"
                type="date"
                name="thoiGianKetThuc"
                value={createForm.thoiGianKetThuc}
                onChange={e => {
                  setCreateForm({
                    ...createForm,
                    thoiGianKetThuc: e.target.value,
                  });
                }}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={createForm.phatHanh}
                    onChange={(e) => {
                      setCreateForm({
                        ...createForm,
                        phatHanh: e.target.checked,
                      });
                    }}
                  />
                }
                label="Kích hoạt"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {setOpenCreate(false); resetCreateForm();}}>Hủy</Button>
            <Button variant="contained"  onClick={handleCreateHocKy}>
              Lưu
            </Button>
          </DialogActions>
        </Dialog>




        <ConfirmDialog
          open={confirmOpen}
          title="Xóa phân công"
          message={`Bạn có chắc muốn xóa học kỳ "${selectedRow?.tenHocKy}" không?`}
          confirmText="Xóa"
          cancelText="Hủy"
          onClose={handleCloseConfirm}
          onConfirm={handleConfirmDelete}
        />
      </Stack>
    </Box>
  );
};

export default QuanLyHocKy;

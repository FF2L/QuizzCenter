import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { AdminApi } from "../../../services/admin.api";
import { toast } from "react-toastify";
import ConfirmDialog from "../../../common/dialog";

type RowSV = {
  nd_id: number;
  masinhvien: string;
  hotensinhvien: string;
  emailsinhvien: string;
  anhdaidiensinhvien?: string | null;
  gioitinhsinhvien: string;
  

};

const ThemSinhVienVaoLopHocPhan = () => {
  const { idLopHocPhan } = useParams<{ idLopHocPhan: string }>();
  const { state } = useLocation() as any;

  const [search, setSearch] = useState("");
  const [maSV, setMaSV] = useState("");
  const [rows, setRows] = useState<RowSV[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedSV, setSelectedSV] = useState<RowSV | null>(null);
      const [openImport, setOpenImport] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [errorRows, setErrorRows] = useState<any[]>([]);
  const [thanhCong, setThanhCong] = useState('');

  const tenLopHoc = state?.tenLopHoc;
  const tenMonHoc = state?.tenMonHoc;
  const navigate = useNavigate();

  const loadData = async () => {
    if (!idLopHocPhan) return;
    setLoading(true);
    const res = await AdminApi.layTatCaSinhVienCuaLopHocPhan(
      +idLopHocPhan,
      page,
      rowsPerPage,
      search?.trim() || undefined
    );
    if (res?.ok) {
      setRows(res.data?.data ?? []);
      setTotal(res.data?.total ?? 0);
      // currentPage từ backend nếu có
      if (res.data?.currentPage) setPage(res.data.currentPage);
    } else {
      toast.error("Tải danh sách sinh viên thất bại");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idLopHocPhan, page, search, openImport]);

  const handleAdd = async () => {
    if (!maSV.trim()) {
      toast.error("Vui lòng nhập mã sinh viên");
      return;
    }
    if (!idLopHocPhan) return;
    const res = await AdminApi.themSinhVienVaoLopHocPhan(+idLopHocPhan, maSV.trim());
    if (res?.ok !== false) {
      toast.success("Thêm sinh viên thành công");
      setMaSV("");
      // reload trang hiện tại
      loadData();
      setTotal((t) => t + 1);
    } else {
      const err: any = res?.error;
      const msg = err?.response?.data?.message ?? "Thêm thất bại";
      toast.error(String(msg));
    }
  };

    const handleClickDelete = (row: any) => {
    setSelectedSV(row);
      setConfirmOpen(true);
    };
  const handleCloseConfirm = () => {
    setConfirmOpen(false);
    setSelectedSV(null);
  };
  const handleConfirmDelete = () => {
    if (selectedSV) {
      handleDelete(selectedSV.masinhvien);
      handleCloseConfirm();
    }
  };

  const handleDelete = async (maSinhVien: string) => {
    if (!idLopHocPhan) return;
    const res = await AdminApi.xoaSinhVienKhoiLopHocPhan(+idLopHocPhan, maSinhVien);
    if (res?.ok) {
      toast.success("Xóa sinh viên khỏi lớp thành công");
      setRows((prev) => prev.filter((x) => x.masinhvien !== maSinhVien));
      setTotal((t) => t - 1);
    } else {
      const err: any = res?.error;
      const msg = err?.response?.data?.message ?? "Xóa thất bại";
      toast.error(String(msg));
    }
  };

  //Xuất danh sách lớp học phần
  const handleExport = async () => {
    if (!idLopHocPhan) return;
    const res = await AdminApi.xuatDanhSachSinhVienExcel(+idLopHocPhan);
    if (res?.ok) {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `DanhSachSinhVien_LopHocPhan_${tenLopHoc}_${tenMonHoc}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } else {
      toast.error("Xuất danh sách thất bại");
    }
  };

  //Nhập từ file excel
    const handleOpenImport = () => {
    setFile(null);
    setThanhCong('');
    setErrorRows([]);
    setOpenImport(true);
    };

    const handleCloseImport = () => {
    if (loading) return;
    setOpenImport(false);
    };

    const handleSubmitImport = async () => {
    if (!file) return;
    if(!idLopHocPhan) return;
    setLoading(true);
    const res:any = await AdminApi.nhapDanhSachSinhVienExcel(+idLopHocPhan,file);
    setLoading(false);
    if (res?.ok !== false) {
        const {thanhCong, thatBai} = res.data;
        console.log('thanhCong', thanhCong);
        console.log('thatBai', thatBai);
        if(thatBai.length >0){
            setThanhCong(`Số sinh viên được thêm thành công: ${thanhCong}`);
            setErrorRows(thatBai);
        }
        if(thatBai.length === 0){
             setOpenImport(false);
        }
    } else {
        const err: any = res.error;
        const mess = err.response?.data?.message
        toast.error(mess);
    }
    };



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
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Thêm sinh viên vào lớp học phần
            </Typography>
            {(tenLopHoc || tenMonHoc) && (
              <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
                {tenLopHoc ? `Lớp: ${tenLopHoc}` : ""} {tenMonHoc ? ` • Môn: ${tenMonHoc}` : ""}
              </Typography>
            )}
            {total && (
              <Typography variant="caption" sx={{ color: "text.disabled" }}>
                Sĩ số: {total}
              </Typography>
            )}
          </Box>

          <Stack direction="row" spacing={2} alignItems="flex-end">
            {/* Ô tìm kiếm nằm TRÊN ô nhập mã SV theo yêu cầu */}
            <Stack direction="column">

            <TextField
              label="Tìm theo tên sinh viên"
              variant="outlined"
              size="small"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
            <IconButton
            onClick={() => navigate(-1)}
            sx={{
              color: "black",
              borderRadius: "12px",
              width: 60,
              height: 60,
              ml: 2,
              "&:hover": { backgroundColor: "#1e4d42",color:"white" },
              alignSelf:"flex-end",
              pt: 5
            }}
          >
            <ArrowBackIcon />
          </IconButton>
            </Stack>
          </Stack>
        </Stack>

        {/* Hàng thêm sinh viên */}
        <Stack direction="row" spacing={3} alignItems="center" justifyContent= "space-between">
          {rows.length > 0 ?
          (<Button variant="contained" onClick={handleExport}>Xuất danh sách lớp</Button>) :
          (<Button variant="contained" disabled>Xuất danh sách lớp</Button>) }
          
          <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="Nhập mã sinh viên"
            variant="outlined"
            size="small"
            value={maSV}
            onChange={(e) => setMaSV(e.target.value)}
            sx={{ minWidth: 220 }}
          />
          <Button variant="contained" onClick={handleAdd}>
            Thêm
          </Button>
          <Button variant="contained" onClick={handleOpenImport}>Nhập file excel </Button>
          </Stack>
        </Stack>

        {/* Bảng danh sách */}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={60}>Ảnh</TableCell>
              <TableCell width={140}>MSSV</TableCell>
              <TableCell>Họ tên</TableCell>
              <TableCell width={120}>Giới tính</TableCell>
              <TableCell width={260}>Email</TableCell>
              <TableCell width={140}>Hành động</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {loading ? "Đang tải..." : "Chưa có sinh viên nào trong lớp này."}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((sv) => (
                <TableRow key={`${sv.nd_id}-${sv.masinhvien}`}>
                  <TableCell>
                    <Avatar
                      src={sv.anhdaidiensinhvien ?? undefined}
                      alt={sv.hotensinhvien}
                      sx={{ width: 36, height: 36 }}
                    />
                  </TableCell>
                  <TableCell>{sv.masinhvien}</TableCell>
                  <TableCell>{sv.hotensinhvien}</TableCell>
                  <TableCell>{sv.gioitinhsinhvien}</TableCell>
                  <TableCell>{sv.emailsinhvien}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={5}>
                      <a
                        style={{ color: "#d32f2f", cursor: "pointer", textDecoration: "none" }}
                        onClick={() => handleClickDelete(sv)}
                      >
                        Xóa
                      </a>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>

        </Table>
          <Box sx={{ display: "flex", justifyContent: "flex-end", pr: 10, pb: 3 }}>
            <Pagination
              count={Math.ceil(total / rowsPerPage)}   // tổng số trang
              page={page}                              // đang ở trang nào
              onChange={(_, value) => setPage(value)}  // đổi trang => loadData chạy lại
              shape="rounded"
              siblingCount={0}
              boundaryCount={1}
            />
          </Box>
      </Stack>
          <ConfirmDialog
            open={confirmOpen}
            title="Xóa sinh viên"
            message={`Bạn có chắc muốn xóa sinh viên ${selectedSV?.hotensinhvien ?? ""} không?`}
            confirmText="Xóa"
            cancelText="Hủy"
            onClose={handleCloseConfirm}
            onConfirm={handleConfirmDelete}
            />

            <Dialog
            open={openImport}
            onClose={handleCloseImport}
            fullWidth
            maxWidth="sm"
            >
            <DialogTitle>Nhập sinh viên từ file Excel</DialogTitle>

            <DialogContent>

                {/* Upload file */}
                <Box mt={2}>
                <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                >
                    {file ? file.name : "Chọn file Excel"}
                    <input
                    type="file"
                    hidden
                    accept=".xlsx,.xls"
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setFile(f);
                    }}
                    />
                </Button>
                </Box>

                {/* link tải file mẫu */}
                <Box mt={1}>
                <Button
                    variant="text"
                    size="small"
                    href="/template/NhapDanhSachLop.xlsx"
                    download
                >
                    📥 Tải về định dạng mẫu
                </Button>
                </Box>

                {/* Hiển thị dòng lỗi nếu có */}
                {errorRows.length > 0 && (
                <Box mt={2}>
                    <Typography> {thanhCong}</Typography>
                    <Typography fontWeight="bold" mb={1}>
                    Các dòng bị lỗi:
                    </Typography>
                    {errorRows.map((err, idx) => (
                    <Typography key={idx} variant="body2" color="error">
                        Dòng {err.row}: {err.message}
                    </Typography>
                    ))}
                </Box>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={handleCloseImport} disabled={loading}>
                Hủy
                </Button>
                <Button
                variant="contained"
                onClick={handleSubmitImport}
                disabled={!file || loading}
                >
                {loading ? "Đang xử lý..." : "Thêm vào hệ thống"}
                </Button>
            </DialogActions>
            </Dialog>
    </Box>
  );
};

export default ThemSinhVienVaoLopHocPhan;

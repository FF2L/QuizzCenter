import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  MenuItem,
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
  anhDaiDienSinhVien?: string | null;
  gioitinhsinhvien: string;
  

};

const ThemSinhVienVaoLopHocPhan = () => {
  const { idLopHocPhan } = useParams<{ idLopHocPhan: string }>();
  const { state } = useLocation() as any;

  const [search, setSearch] = useState("");
  const [maSV, setMaSV] = useState("");
  const [rows, setRows] = useState<RowSV[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1); // 1-based để khớp backend
  const rowsPerPage = 10;
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedSV, setSelectedSV] = useState<RowSV | null>(null);

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
  }, [idLopHocPhan, page, search]);

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
                      src={sv.anhDaiDienSinhVien ?? undefined}
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

          <TablePagination
            component="div"
            count={total}
            page={page - 1}
            onPageChange={(_, newPage) => setPage(newPage + 1)}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[]}
          />
        </Table>
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
    </Box>
  );
};

export default ThemSinhVienVaoLopHocPhan;

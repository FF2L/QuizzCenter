// BaiKiemTraList.tsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  IconButton,
  Pagination,
  TextField,
  Tabs,
  Tab,
} from "@mui/material";
import { BaiKiemTra } from "../../../common/model";
import CreateBaiKiemTraDialog from "../test/createTestDialog";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ViewBaiKiemTraDialog from "../test/testDetailDalog";
import UpdateBaiKiemTraDialog from "../test/updateTestDialog";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Breadcrumbs from "@mui/material/Breadcrumbs";

interface ApiResponse {
  data: BaiKiemTra[];
  total: number;
  currentPage: number;
  totalPages: number;
}

const BaiKiemTraList = () => {
  const { idLopHocPhan } = useParams<{ idLopHocPhan: string }>();
  const [baiKiemTraList, setBaiKiemTraList] = useState<BaiKiemTra[]>([]);
  const [loading, setLoading] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [selectedBai, setSelectedBai] = useState<BaiKiemTra | null>(null);
  
  // State cho tab và phân trang
  const [tabValue, setTabValue] = useState<number>(0); // 0: Bài kiểm tra, 1: Bài luyện tập
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const location = useLocation();
  const { tenMonHoc, tenLopHoc, idMonHoc } = location.state || {};
  const navigate = useNavigate();

  // Lấy accessToken
  const accessToken = localStorage.getItem("accessTokenGV") || "";

  // Mapping tab index sang loaiKiemTra
  const getLoaiKiemTra = () => {
    return tabValue === 0 ? "BaiKiemTra" : "LuyenTap";
  };

  // Format datetime để hiển thị ngày giờ
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fetch bài kiểm tra với query params
  const fetchBaiKiemTra = async () => {
    try {
      setLoading(true);
      setBaiKiemTraList([]); // Clear data cũ
      
      const skip = (currentPage - 1) * limit;

      const params = new URLSearchParams({
        loaiKiemTra: getLoaiKiemTra(),
        skip: skip.toString(),
        limit: limit.toString(),
      });

      // Thêm search nếu có
      if (searchValue.trim()) {
        params.append("tenBaiKiemTra", searchValue.trim());
      }

      const url = `http://localhost:3000/bai-kiem-tra/${idLopHocPhan}?${params.toString()}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      if (!res.ok) {
        throw new Error("Lỗi khi tải dữ liệu");
      }

      const response: ApiResponse = await res.json();
      
      // Sort theo update_at
      const sortedData = response.data.sort(
        (a, b) =>
          new Date(b.update_at).getTime() - new Date(a.update_at).getTime()
      );
      
      setBaiKiemTraList(sortedData);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Lỗi fetch bài kiểm tra:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data khi component mount hoặc dependencies thay đổi
  useEffect(() => {
    if (accessToken) {
      fetchBaiKiemTra();
    }
  }, [idLopHocPhan, tabValue, currentPage]);

  // Debounce cho search
  useEffect(() => {
    if (!accessToken) return;

    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset về trang 1 khi search
      fetchBaiKiemTra();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchValue]);

  const handleCreateBaiKiemTra = async (payload: any) => {
    try {
      const res = await fetch("http://localhost:3000/bai-kiem-tra", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Refresh lại danh sách sau khi tạo mới
        fetchBaiKiemTra();
        setOpenCreateDialog(false);
      } else {
        const errorText = await res.text();
        console.error("Tạo bài kiểm tra thất bại:", errorText);
        alert("Tạo bài kiểm tra thất bại!");
      }
    } catch (error) {
      console.error("Lỗi tạo bài kiểm tra:", error);
      alert("Có lỗi xảy ra khi tạo bài kiểm tra.");
    }
  };

  const handleUpdateBaiKiemTra = async (id: number, payload: any) => {
    try {
      const res = await fetch(`http://localhost:3000/bai-kiem-tra/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Refresh lại danh sách sau khi update
        fetchBaiKiemTra();
        setOpenUpdateDialog(false);
      } else {
        const errorText = await res.text();
        console.error("Cập nhật thất bại:", errorText);
        alert("Cập nhật thất bại!");
      }
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      alert("Có lỗi xảy ra khi cập nhật.");
    }
  };

  const handleViewDetail = (bai: BaiKiemTra) => {
    setSelectedId(bai.id);
    setOpenViewDialog(true);
  };

  const handleUpdate = (bai: BaiKiemTra) => {
    setSelectedBai(bai);
    setOpenUpdateDialog(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài kiểm tra này?")) return;

    try {
      const res = await fetch(`http://localhost:3000/bai-kiem-tra/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (res.ok) {
        // Refresh lại danh sách sau khi xóa
        fetchBaiKiemTra();
        alert("Xóa thành công!");
      } else {
        const errorText = await res.text();
        console.error("Xóa thất bại:", errorText);
        alert("Xóa thất bại!");
      }
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      alert("Có lỗi xảy ra khi xóa.");
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setCurrentPage(1); // Reset về trang 1 khi đổi tab
    setSearchValue(""); // Clear search khi đổi tab
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  return (
    <Box sx={{ p: 2, backgroundColor: "#F8F8F8", minHeight: "100vh" }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">Bài kiểm tra</Typography>
        </Box>
        <Button
          sx={{ backgroundColor: "#245D51" }}
          variant="contained"
          onClick={() => setOpenCreateDialog(true)}
        >
          Tạo bài kiểm tra
        </Button>
      </Stack>

      {/* Breadcrumbs */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 2,
          backgroundColor: "#f9f9f9",
          p: 1.5,
          borderRadius: 2,
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <Breadcrumbs
          aria-label="breadcrumb"
          separator="›"
          sx={{
            color: "#555",
            "& .MuiTypography-root": { fontSize: 15 },
          }}
        >
          <Typography sx={{ color: "#555" }}>
            Môn học (<span style={{ color: "#e91e63" }}>{tenMonHoc}</span>)
          </Typography>

          <Typography sx={{ color: "#555" }}>
            Lớp học (<span style={{ color: "#007CD5" }}>{tenLopHoc}</span>)
          </Typography>

          <Typography sx={{ color: "#555", fontWeight: "bold" }}>
            Bài kiểm tra
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            "& .MuiTab-root": {
              fontSize: "16px",
              fontWeight: "medium",
              textTransform: "none",
            },
          }}
        >
          <Tab label="Bài kiểm tra" />
          <Tab label="Bài luyện tập" />
        </Tabs>
      </Box>

      {/* Search */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          placeholder={`Tìm kiếm ${tabValue === 0 ? "bài kiểm tra" : "bài luyện tập"}...`}
          value={searchValue}
          onChange={handleSearch}
          sx={{
            width: "300px",
            "& .MuiOutlinedInput-root": {
              backgroundColor: "white",
              height: "50px",
            },
            "& .MuiInputBase-input": {
              color: "black",
              fontSize: "16px",
              fontWeight: "medium",
            },
          }}
        />
      </Box>

      {/* Danh sách */}
      <Stack spacing={2}>
        {loading && <Typography>Đang tải...</Typography>}
        {!loading && baiKiemTraList.length === 0 && (
          <Typography>
            Chưa có {tabValue === 0 ? "bài kiểm tra" : "bài luyện tập"} nào.
          </Typography>
        )}

        {!loading &&
          baiKiemTraList.map((bai) => (
            <Card
              onClick={() =>
                navigate(`/lecturer/bai-kiem-tra/${bai.id}`, {
                  state: {
                    tenLopHoc: tenLopHoc,
                    tenMonHoc,
                    tenBaiKiemTra: bai.tenBaiKiemTra,
                    idMonHoc
                  },
                })
              }
              key={bai.id}
              sx={{
                cursor: "pointer",
                "&:hover": { boxShadow: 3 },
                backgroundColor: "white",
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  {/* Info */}
                  <Stack spacing={1} flex={1}>
                    <Typography sx={{ fontWeight: "bold", fontSize: "18px" }}>
                      {bai.tenBaiKiemTra}
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: "#555" }}>
                      Loại: {bai.loaiKiemTra === "BaiKiemTra" ? "Bài kiểm tra" : "Bài luyện tập"}
                      {" | "}Số lần làm: {bai.soLanLam || 1}
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: "#555" }}>
                      Bắt đầu: {formatDateTime(bai.thoiGianBatDau)}
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: "#555" }}>
                      Kết thúc: {formatDateTime(bai.thoiGianKetThuc)}
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: "#555" }}>
                      Thời gian làm: {bai.thoiGianLam / 60} phút
                    </Typography>
                  </Stack>

                  {/* Actions */}
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      sx={{
                        color: "#DB9C14",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetail(bai);
                      }}
                      title="Xem chi tiết"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      sx={{ color: "#0DC913" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdate(bai);
                      }}
                      title="Chỉnh sửa"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      sx={{
                        color: "#d32f2f",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(bai.id);
                      }}
                      title="Xóa"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
      </Stack>

      {/* Phân trang */}
      {!loading && totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* Dialogs */}
      <CreateBaiKiemTraDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onCreate={handleCreateBaiKiemTra}
        idLopHocPhan={Number(idLopHocPhan)}
      />
      <ViewBaiKiemTraDialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        idBaiKiemTra={selectedId}
      />
      <UpdateBaiKiemTraDialog
        open={openUpdateDialog}
        onClose={() => setOpenUpdateDialog(false)}
        baiKiemTra={selectedBai}
        onUpdate={handleUpdateBaiKiemTra}
      />
    </Box>
  );
};

export default BaiKiemTraList;
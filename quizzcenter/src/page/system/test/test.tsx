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
  Chip,
  Grid,
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
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedBaiForMenu, setSelectedBaiForMenu] = useState<BaiKiemTra | null>(null);
  const openMenu = Boolean(anchorEl);

  const [tabValue, setTabValue] = useState<number>(0);
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const location = useLocation();
  const { tenMonHoc, tenLopHoc, idMonHoc } = location.state || {};
  const navigate = useNavigate();

  const accessToken = localStorage.getItem("accessTokenGV") || "";
  
  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>, bai: BaiKiemTra) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedBaiForMenu(bai);
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
    setSelectedBaiForMenu(null);
  };
  
  const handleXemBangDiem = () => {
    if (!selectedBaiForMenu) return;
    navigate(`/lecturer/lop-hoc-phan/${idLopHocPhan}/bai-kiem-tra/${selectedBaiForMenu.id}/bang-diem`, {
      state: {
        tenLopHoc,
        tenMonHoc,
        tenBaiKiemTra: selectedBaiForMenu.tenBaiKiemTra,
        idMonHoc
      },
    });
    handleCloseMenu();
  };
  
  const getLoaiKiemTra = () => {
    return tabValue === 0 ? "BaiKiemTra" : "LuyenTap";
  };

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

  const fetchBaiKiemTra = async () => {
    try {
      setLoading(true);
      setBaiKiemTraList([]);
      
      const skip = (currentPage - 1) * limit;

      const params = new URLSearchParams({
        loaiKiemTra: getLoaiKiemTra(),
        skip: skip.toString(),
        limit: limit.toString(),
      });

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

  useEffect(() => {
    if (accessToken) {
      fetchBaiKiemTra();
    }
  }, [idLopHocPhan, tabValue, currentPage]);

  useEffect(() => {
    if (!accessToken) return;

    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
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
    setCurrentPage(1);
    setSearchValue("");
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
          <Typography sx={{ color: "#777" }}>
            Lớp học:<span style={{ fontWeight: 600, color: "#777" }}>{tenLopHoc}</span>
          </Typography>

          <Typography sx={{ color: "#333", fontWeight: 600 }}>
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
      <Typography sx={{ color: "#333", marginBottom:"10px" }}>
            Môn học: <span style={{ fontWeight: 600, color: "green" }}>{tenMonHoc}</span>
          </Typography>
      {/* Danh sách - Grid Layout */}
      {loading && <Typography>Đang tải...</Typography>}
      {!loading && baiKiemTraList.length === 0 && (
        <Typography>
          Chưa có {tabValue === 0 ? "bài kiểm tra" : "bài luyện tập"} nào.
        </Typography>
      )}

      {!loading && baiKiemTraList.length > 0 && (
        <Grid container spacing={2}>
          {baiKiemTraList.map((bai) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={bai.id}>
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
                sx={{
                  cursor: "pointer",
                  boxShadow: "none", 
                  "&:hover": { 
                    boxShadow: "none", 
                    transform: "translateY(-2px)" 
                  },
                  transition: "all 0.2s ease",
                  backgroundColor: "white",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 2,
                  border: "1px solid #e0e0e0"
                }}
              >
                <CardContent sx={{ 
                  flexGrow: 1, 
                  p: 2.5,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2
                }}>
                  {/* Header: Tên + Status */}
                  <Box>
                    <Typography 
                      sx={{ 
                        fontWeight: 600, 
                        fontSize: "20px",
                        color: "#1a1a1a",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        minHeight: "50px",
                        lineHeight: 1.4
                      }}
                    >
                      {bai.tenBaiKiemTra}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={bai.loaiKiemTra === "BaiKiemTra" ? "Kiểm tra" : "Luyện tập"}
                        size="small"
                        sx={{
                          backgroundColor: bai.loaiKiemTra === "BaiKiemTra" ? "#e3f2fd" : "#f3e5f5",
                          color: bai.loaiKiemTra === "BaiKiemTra" ? "#1565c0" : "#7b1fa2",
                          fontWeight: 600,
                          fontSize: "11px",
                          height: "22px"
                        }}
                      />
                      
                      {(new Date(bai.thoiGianKetThuc) <= new Date()) && (
                        <Chip
                          label="Đã đóng"
                          size="small"
                          sx={{
                            backgroundColor: "#ffebee",
                            color: "#c62828",
                            fontWeight: 600,
                            fontSize: "11px",
                            height: "22px"
                          }}
                        />
                      )}
                    </Stack>
                  </Box>

                  {/* Thông tin chi tiết */}
                  <Box sx={{ 
                    backgroundColor: "#fafafa", 
                    p: 1.5, 
                    width:"200px",
                    borderRadius: 1.5,
                    flexGrow: 1
                  }}>
                    <Stack spacing={1.2}>
                      <Box>
                        <Typography sx={{ fontSize: 18, color: "#757575", fontWeight: 500, mb: 0.3 }}>
                          Thời gian bắt đầu:
                        </Typography>
                        <Typography sx={{ fontSize: 18, color: "#424242", fontWeight: 500 }}>
                          {formatDateTime(bai.thoiGianBatDau)}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography sx={{ fontSize: 18, color: "#757575", fontWeight: 500, mb: 0.3 }}>
                          Thời gian kết thúc:
                        </Typography>
                        <Typography sx={{ fontSize: 18, color: "#424242", fontWeight: 500 }}>
                          {formatDateTime(bai.thoiGianKetThuc)}
                        </Typography>
                      </Box>

                      <Box>
                      {bai.loaiKiemTra === "BaiKiemTra" && (
                        <Box>
                          <Typography sx={{ fontSize: 18, color: "#757575", fontWeight: 500, mb: 0.3 }}>
                            Thời gian làm bài:
                          </Typography>
                          <Typography sx={{ fontSize: 18, color: "#424242", fontWeight: 600 }}>
                            {bai.thoiGianLam / 60} phút
                          </Typography>
                        </Box>
                      )}
                      </Box>
                    </Stack>
                  </Box>

                  {/* Actions */}
                  <Stack 
                    direction="row" 
                    spacing={1} 
                    justifyContent="center"
                    sx={{ 
                      borderTop: "1px solid #e0e0e0",
                      pt: 1.5,
                      mt: "auto"
                    }}
                  >
                     <IconButton
                   size="small"
                    sx={{ 
                      color: "#1976d2",
                      "&:hover": { backgroundColor: "#e3f2fd" }
                     }}
                     onClick={(e) => {
                      e.stopPropagation();
                    }}
                     title="Triển khai bài làm"
                         >
                       <AssignmentTurnedInIcon fontSize="small" />
                        </IconButton>

                    <IconButton
                      size="small"
                      sx={{ 
                        color: "#FB8C00",
                        "&:hover": { backgroundColor: "#fff3e0" }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetail(bai);
                      }}
                      title="Xem chi tiết"
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>

                    {(new Date(bai.thoiGianKetThuc) > new Date()) && (
                      <IconButton
                        size="small"
                        sx={{ 
                          color: "#43A047",
                          "&:hover": { backgroundColor: "#e8f5e9" }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdate(bai);
                        }}
                        title="Chỉnh sửa"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}

                    <IconButton
                      size="small"
                      sx={{ 
                        color: "#e53935",
                        "&:hover": { backgroundColor: "#ffebee" }
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(bai.id);
                      }}
                      title="Xóa"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>

                    {(new Date(bai.thoiGianBatDau) <= new Date()) && bai.loaiKiemTra === "BaiKiemTra" && (
                      <IconButton
                        size="small"
                        sx={{
                          color: "#424242",
                          "&:hover": { backgroundColor: "#f5f5f5" }
                        }}
                        onClick={(e) => handleOpenMenu(e, bai)}
                        title="Tùy chọn"
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                      
                    )}

                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

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

      {/* Menu 3 chấm */}
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleXemBangDiem}>
          Xem bảng điểm
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default BaiKiemTraList;
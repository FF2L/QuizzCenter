import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Skeleton,
  Button,
  TextField,
  Pagination,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AssignmentIcon from "@mui/icons-material/Assignment";

interface BaiKiemTra {
  id: number;
  tenBaiKiemTra: string;
  loaiKiemTra: string; // "BaiKiemTra" | "LuyenTap"
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  thoiGianLam: number; // seconds
  soLanLam: number;
  xemBaiLam?: boolean;
  hienThiKetQua?: boolean;
  update_at: string;
}

interface ApiResponse {
  data: BaiKiemTra[];
  total: number;
  currentPage: number;
  totalPages: number;
}

interface GroupedData {
  baiKiemTra: BaiKiemTra[];
  luyenTap: BaiKiemTra[];
}

const CollegeTest: React.FC = () => {
  const { idLopHocPhan } = useParams<{ idLopHocPhan: string }>();
  const location = useLocation();
  const { tenMonHoc, maMonHoc } = location.state || { tenMonHoc: "", maMonHoc: "" };
  const navigate = useNavigate();

  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [baiKiemTraList, setBaiKiemTraList] = useState<BaiKiemTra[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // State để kiểm soát accordion
  const [expandedBaiKiemTra, setExpandedBaiKiemTra] = useState(true);
  const [expandedLuyenTap, setExpandedLuyenTap] = useState(true);

  // Lấy accessToken của sinh viên
  const accessToken = localStorage.getItem("accessTokenSV") || "";

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

  // Kiểm tra xem bài kiểm tra có mới không (trong vòng 7 ngày)
  const isNewBaiKiemTra = (updateAt: string): boolean => {
    const now = new Date();
    const updateDate = new Date(updateAt);
    const diffInMs = now.getTime() - updateDate.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    return diffInDays <= 3;
  };

  // Fetch bài kiểm tra với query params - GIỐNG HỆT PAGE GV
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

      const url = `${process.env.REACT_APP_BACK_END_URL}/bai-kiem-tra/sinh-vien/${idLopHocPhan}?${params.toString()}`;

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
  const handleBack = () => {
    // Lấy idLopHocPhan từ baiKiemTra state hoặc từ URL params
      navigate(-1);
  };
  // Fetch data khi component mount hoặc dependencies thay đổi
  useEffect(() => {
    if (accessToken && tabValue < 2) {
      fetchBaiKiemTra();
    }
  }, [idLopHocPhan, tabValue, currentPage]);

  // Debounce cho search
  useEffect(() => {
    if (!accessToken || tabValue >= 2) return;

    const timeoutId = setTimeout(() => {
      setCurrentPage(1); // Reset về trang 1 khi search
      fetchBaiKiemTra();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchValue]);

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

  // Kiểm tra xem tất cả có đang mở hay không
  const isAllExpanded = expandedBaiKiemTra && expandedLuyenTap;

  // Toggle tất cả accordion
  const handleToggleAll = () => {
    const newState = !isAllExpanded;
    setExpandedBaiKiemTra(newState);
    setExpandedLuyenTap(newState);
  };
  // Nhóm dữ liệu theo loại
  const groupedData: GroupedData = {
    baiKiemTra: baiKiemTraList.filter((item) => item.loaiKiemTra === "BaiKiemTra"),
    luyenTap: baiKiemTraList.filter((item) => item.loaiKiemTra === "LuyenTap"),
  };

  const BaiKiemTraItem = ({ item }: { item: BaiKiemTra }) => (
    <Paper
      onClick={() =>
        navigate(`/quizzcenter/bai-kiem-tra-chi-tiet/${item.id}`, {
          state: item,
        })
      }
      sx={{
        p: 2,
        mb: 1.5,
        cursor: "pointer",
        transition: "all 0.2s",
        boxShadow:"none",
        border:"1px solid #cccccc",
        "&:hover": {
          backgroundColor: "#f8f9fa",
        },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
            backgroundColor: "#145c26",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <AssignmentIcon sx={{ color: "#fff", fontSize: 24 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <Typography
              variant="subtitle1"
              sx={{
                color: "#145c26",
                fontWeight: 600,
              }}
            >
              {item.loaiKiemTra === "BaiKiemTra" ? "TRẮC NGHIỆM" : "LUYỆN TẬP"}
            </Typography>
            {isNewBaiKiemTra(item.update_at) && (
              <Chip
                label="Mới"
                size="small"
                sx={{
                  height: 20,
                  fontSize: 11,
                  fontWeight: 600,
                  backgroundColor: "#4caf50",
                  color: "white",
                  "& .MuiChip-label": {
                    px: 1,
                  },
                }}
              />
            )}
          </Stack>
          <Typography variant="body1" sx={{color:"#ff6a00", fontWeight: 500, mb: 0.5 }}>
            {item.tenBaiKiemTra}
          </Typography>
          <Typography variant="body2" sx={{ color: "#666", fontSize: 13 }}>
            Bắt đầu: {formatDateTime(item.thoiGianBatDau)} | Kết thúc:{" "}
            {formatDateTime(item.thoiGianKetThuc)}
          </Typography>
          {(item.loaiKiemTra === "BaiKiemTra") && (
            <Typography variant="body2" sx={{ color: "#666", fontSize: 13 }}>
            Thời gian làm: {item.thoiGianLam / 60} phút
          </Typography>
          )}
          
        </Box>
      </Stack>
    </Paper>
  );

  const LoadingSkeleton = () => (
    <Box>
      {[1, 2, 3].map((i) => (
        <Paper key={i} sx={{ p: 2, mb: 1.5 }}>
          <Stack direction="row" spacing={2}>
            <Skeleton variant="rounded" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton width="30%" height={24} />
              <Skeleton width="70%" height={20} sx={{ mt: 1 }} />
            </Box>
          </Stack>
        </Paper>
      ))}
    </Box>
  );

  return (
    <Box sx={{ flex: 1, pt: "40px", px: { xs: 2, md: 8 }, pb: 4 }}>
      <Box sx={{display:'flex', flexDirection:'row'}}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{ fontWeight: 600, height:"40px" }}
        variant="text"
        color="primary"
      >
      </Button>
      {/* Header với tên môn */}
      <Typography
        variant="h5"
        sx={{
          color: "#ff6a00",
          fontWeight: 700,
        }}
      >
        {tenMonHoc} ({maMonHoc})
      </Typography>
      </Box>
      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 500,
              color: "#666",
            },
            "& .Mui-selected": {
              color: "#4caf50 !important",
              fontWeight: 600,
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#4caf50",
              height: 3,
            },
          }}
        >
          <Tab label="Bài kiểm tra" />
          <Tab label="Bài luyện tập" />
          {/* <Tab label="Điểm số" /> */}
        </Tabs>
      </Box>

      {/* Nội dung tab - Bài kiểm tra */}
      {tabValue === 0 && (
        <Box>
          {/* Search */}
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <TextField
              placeholder="Tìm kiếm bài kiểm tra..."
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

          {loading ? (
            <LoadingSkeleton />
          ) : baiKiemTraList.length === 0 ? (
            <Typography color="text.secondary">
              Chưa có bài kiểm tra nào
            </Typography>
          ) : (
            <>
              {baiKiemTraList.map((item) => (
                <BaiKiemTraItem key={item.id} item={item} />
              ))}

              {/* Phân trang */}
              {totalPages > 1 && (
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
            </>
          )}
        </Box>
      )}

      {/* Nội dung tab - Bài luyện tập */}
      {tabValue === 1 && (
        <Box>
          {/* Search */}
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <TextField
              placeholder="Tìm kiếm bài luyện tập..."
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

          {loading ? (
            <LoadingSkeleton />
          ) : baiKiemTraList.length === 0 ? (
            <Typography color="text.secondary">
              Chưa có bài luyện tập nào
            </Typography>
          ) : (
            <>
              {baiKiemTraList.map((item) => (
                <BaiKiemTraItem key={item.id} item={item} />
              ))}

              {/* Phân trang */}
              {totalPages > 1 && (
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
            </>
          )}
        </Box>
      )}

      {/* Tab điểm số */}
      {/* {tabValue === 2 && (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            Chức năng Điểm số đang được phát triển
          </Typography>
        </Box>
      )} */}
    </Box>
  );
};

export default CollegeTest;
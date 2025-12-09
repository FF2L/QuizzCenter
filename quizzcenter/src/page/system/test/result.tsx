import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Stack,
  Breadcrumbs,
  CircularProgress,
  Tabs,
  Tab,
  TableSortLabel,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { LectureService } from "../../../services/lecture.api";
import ThongKeBangDiemPage from "./statistical";

interface BangDiem {
  nd_id: number;
  maSinhVien: string;
  hoTenSinhVien: string;
  emailSinhVien: string;
  tenBaiKiemTra: string;
  diem: number;
}

type OrderDirection = "asc" | "desc";
type SortableField = "hoTenSinhVien" | "maSinhVien" | "emailSinhVien" | "diem";

const BangDiemPage = () => {
  const { idLopHocPhan, idBaiKiemTra } = useParams<{
    idLopHocPhan: string;
    idBaiKiemTra: string;
  }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { tenLopHoc, tenMonHoc, tenBaiKiemTra, idMonHoc } = location.state || {};

  const [bangDiemList, setBangDiemList] = useState<BangDiem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [orderBy, setOrderBy] = useState<SortableField>("hoTenSinhVien");
  const [order, setOrder] = useState<OrderDirection>("asc");

  const accessToken = localStorage.getItem("accessTokenGV") || "";

  // Fetch bảng điểm
  const fetchBangDiem = async (tenSinhVien?: string) => {
    try {
      setLoading(true);
      
      let response;
      if (tenSinhVien && tenSinhVien.trim()) {
        response = await LectureService.timKiemBangDiemTheoTen(
          accessToken,
          Number(idLopHocPhan),
          Number(idBaiKiemTra),
          tenSinhVien.trim()
        );
      } else {
        response = await LectureService.xemTatCaBangDiem(
          accessToken,
          Number(idLopHocPhan),
          Number(idBaiKiemTra)
        );
      }

      if (response.ok) {
        setBangDiemList(response.data);
      } else {
        console.error("Lỗi khi tải bảng điểm:", response.error);
        alert("Không thể tải bảng điểm!");
      }
    } catch (error) {
      console.error("Lỗi fetch bảng điểm:", error);
      alert("Có lỗi xảy ra khi tải bảng điểm.");
    } finally {
      setLoading(false);
    }
  };

  // Load dữ liệu lần đầu
  useEffect(() => {
    if (accessToken && idLopHocPhan && idBaiKiemTra) {
      fetchBangDiem();
    }
  }, [idLopHocPhan, idBaiKiemTra]);

  // Tìm kiếm với debounce
  useEffect(() => {
    if (!accessToken || currentTab !== 0) return;

    const timeoutId = setTimeout(() => {
      fetchBangDiem(searchValue);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchValue]);

  // Xuất file điểm
  const handleXuatBangDiem = async () => {
    try {
      setIsExporting(true);
      const response = await LectureService.xuatBangDiem(
        accessToken,
        Number(idLopHocPhan),
        Number(idBaiKiemTra)
      );

      if (response.ok) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `BangDiem_${tenBaiKiemTra}_${Date.now()}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert("Không thể xuất bảng điểm!");
      }
    } catch (error) {
      console.error("Lỗi xuất bảng điểm:", error);
      alert("Có lỗi xảy ra khi xuất bảng điểm.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  // Xử lý sort
  const handleRequestSort = (property: SortableField) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Hàm so sánh để sort
  const getComparator = (
    order: OrderDirection,
    orderBy: SortableField
  ): ((a: BangDiem, b: BangDiem) => number) => {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = (
    a: BangDiem,
    b: BangDiem,
    orderBy: SortableField
  ): number => {
    const aValue = a[orderBy];
    const bValue = b[orderBy];

    // Xử lý số
    if (typeof aValue === "number" && typeof bValue === "number") {
      return bValue - aValue;
    }

    // Xử lý chuỗi
    if (typeof aValue === "string" && typeof bValue === "string") {
      return bValue.localeCompare(aValue, "vi");
    }

    return 0;
  };

  // Sort danh sách
  const sortedBangDiemList = React.useMemo(() => {
    const comparator = getComparator(order, orderBy);
    return [...bangDiemList].sort(comparator);
  }, [bangDiemList, order, orderBy]);

  return (
    <Box sx={{ p: 3, backgroundColor: "#F8F8F8", minHeight: "100vh" }}>
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
          <Typography variant="h4" fontWeight={600}>
            Kết quả bài kiểm tra
          </Typography>
        </Box>
      </Stack>

      {/* Breadcrumbs */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 3,
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
            Lớp học phần:<span style={{ color: "#007CD5" }}>{tenLopHoc}</span>
          </Typography>

          <Typography sx={{ color: "#555" }}>
            Môn học:<span style={{ color: "#e91e63" }}>{tenMonHoc}</span>
          </Typography>

          <Typography sx={{ color: "#555", fontWeight: "bold" }}>
            Bài kiểm tra:<span style={{ color: "#4caf50" }}>{tenBaiKiemTra}</span>
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          sx={{
            "& .MuiTab-root": {
              fontSize: "16px",
              fontWeight: 600,
              textTransform: "none",
              minHeight: "56px",
            },
            "& .Mui-selected": {
              color: "#245D51 !important",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#245D51",
              height: 3,
            },
          }}
        >
          <Tab 
            icon={<ListAltIcon />} 
            iconPosition="start" 
            label="Bảng điểm" 
          />
          <Tab 
            icon={<AssessmentIcon />} 
            iconPosition="start" 
            label="Thống kê" 
          />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {currentTab === 0 ? (
        <>
          {/* Search & Export */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
            spacing={2}
          >
            <TextField
              placeholder="Tìm kiếm theo tên sinh viên..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              sx={{
                width: "400px",
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  height: "50px",
                },
                "& .MuiInputBase-input": {
                  color: "black",
                  fontSize: "16px",
                },
              }}
            />

            <Button
              variant="contained"
              startIcon={isExporting ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />}
              onClick={handleXuatBangDiem}
              disabled={isExporting || bangDiemList.length === 0}
              sx={{
                backgroundColor: "#245D51",
                height: "50px",
                px: 3,
                "&:hover": {
                  backgroundColor: "#1a4740",
                },
              }}
            >
              {isExporting ? "Đang xuất..." : "Xuất file điểm"}
            </Button>
          </Stack>

          <Stack direction="row" spacing={4} mb={3}>
            <Typography variant="body1" fontWeight={500}>
              Tổng số sinh viên: <strong>{bangDiemList.length}</strong>
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              Đạt (≥5):{" "}
              <strong style={{ color: "#4caf50" }}>
                {bangDiemList.filter((item) => item.diem >= 5).length}
              </strong>
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              Không đạt (&lt;5):{" "}
              <strong style={{ color: "#f44336" }}>
                {bangDiemList.filter((item) => item.diem < 5).length}
              </strong>
            </Typography>
          </Stack>

          {/* Table */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
              <CircularProgress />
            </Box>
          ) : bangDiemList.length === 0 ? (
            <Box
              sx={{
                backgroundColor: "white",
                p: 5,
                borderRadius: 2,
                textAlign: "center",
              }}
            >
              <Typography variant="h6" color="text.secondary">
                {searchValue ? "Không tìm thấy sinh viên nào!" : "Chưa có sinh viên nào làm bài!"}
              </Typography>
            </Box>
          ) : (
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: 2,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#245D51" }}>
                    <TableCell
                      sx={{
                        color: "white",
                        fontWeight: 600,
                        fontSize: "16px",
                        textAlign: "center",
                        width: "80px",
                      }}
                    >
                      STT
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        fontWeight: 600,
                        fontSize: "16px",
                        minWidth: "200px",
                      }}
                    >
                      <TableSortLabel
                        active={orderBy === "hoTenSinhVien"}
                        direction={orderBy === "hoTenSinhVien" ? order : "asc"}
                        onClick={() => handleRequestSort("hoTenSinhVien")}
                        sx={{
                          color: "white !important",
                          "&:hover": {
                            color: "white !important",
                          },
                          "& .MuiTableSortLabel-icon": {
                            color: "white !important",
                          },
                          "&.Mui-active": {
                            color: "white !important",
                            "& .MuiTableSortLabel-icon": {
                              color: "white !important",
                            },
                          },
                        }}
                      >
                        Tên sinh viên
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        fontWeight: 600,
                        fontSize: "16px",
                        minWidth: "130px",
                      }}
                    >
                      <TableSortLabel
                        active={orderBy === "maSinhVien"}
                        direction={orderBy === "maSinhVien" ? order : "asc"}
                        onClick={() => handleRequestSort("maSinhVien")}
                        sx={{
                          color: "white !important",
                          "&:hover": {
                            color: "white !important",
                          },
                          "& .MuiTableSortLabel-icon": {
                            color: "white !important",
                          },
                          "&.Mui-active": {
                            color: "white !important",
                            "& .MuiTableSortLabel-icon": {
                              color: "white !important",
                            },
                          },
                        }}
                      >
                        Mã sinh viên
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        fontWeight: 600,
                        fontSize: "16px",
                        minWidth: "220px",
                      }}
                    >
                      <TableSortLabel
                        active={orderBy === "emailSinhVien"}
                        direction={orderBy === "emailSinhVien" ? order : "asc"}
                        onClick={() => handleRequestSort("emailSinhVien")}
                        sx={{
                          color: "white !important",
                          "&:hover": {
                            color: "white !important",
                          },
                          "& .MuiTableSortLabel-icon": {
                            color: "white !important",
                          },
                          "&.Mui-active": {
                            color: "white !important",
                            "& .MuiTableSortLabel-icon": {
                              color: "white !important",
                            },
                          },
                        }}
                      >
                        Email
                      </TableSortLabel>
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "white",
                        fontWeight: 600,
                        fontSize: "16px",
                        textAlign: "center",
                        width: "100px",
                      }}
                    >
                      <TableSortLabel
                        active={orderBy === "diem"}
                        direction={orderBy === "diem" ? order : "asc"}
                        onClick={() => handleRequestSort("diem")}
                        sx={{
                          color: "white !important",
                          "&:hover": {
                            color: "white !important",
                          },
                          "& .MuiTableSortLabel-icon": {
                            color: "white !important",
                          },
                          "&.Mui-active": {
                            color: "white !important",
                            "& .MuiTableSortLabel-icon": {
                              color: "white !important",
                            },
                          },
                        }}
                      >
                        Điểm
                      </TableSortLabel>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedBangDiemList.map((item, index) => (
                    <TableRow
                      key={item.nd_id}
                      sx={{
                        "&:hover": { backgroundColor: "#f5f5f5" },
                        "&:nth-of-type(odd)": { backgroundColor: "#fafafa" },
                      }}
                    >
                      <TableCell
                        sx={{
                          fontSize: "15px",
                          textAlign: "center",
                          fontWeight: 500,
                        }}
                      >
                        {index + 1}
                      </TableCell>
                      <TableCell sx={{ fontSize: "15px", fontWeight: 500 }}>
                        {item.hoTenSinhVien}
                      </TableCell>
                      <TableCell sx={{ fontSize: "15px" }}>
                        {item.maSinhVien}
                      </TableCell>
                      <TableCell sx={{ fontSize: "15px" }}>
                        {item.emailSinhVien}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontSize: "16px",
                          textAlign: "center",
                          fontWeight: 600,
                          color: item.diem >= 5 ? "#4caf50" : "#f44336",
                        }}
                      >
                        {item.diem.toFixed(1)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      ) : (
        <ThongKeBangDiemPage />
      )}
    </Box>
  );
};

export default BangDiemPage;
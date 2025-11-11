// Class.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import {
  Box,
  Card,
  CardContent,
  Collapse,
  IconButton,
  MenuItem,
  Pagination,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
  Chip,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import { Search, CalendarToday, People } from "@mui/icons-material";

// Interface cho dữ liệu trả về từ API
interface LopHocPhanData {
  lhp_id: number;
  tenlhp: string;
  hocky: string;
  thoigianbatdau: string;
  thoigianketthuc: string;
  mamonhoc: string;
  tenmonhoc: string;
  siso: string;
  mh_id: number;
}

interface ApiResponse {
  data: LopHocPhanData[];
  total: number;
  currentPage: number;
  totalPages: number;
}

// Interface cho môn học được nhóm
interface MonHocGroup {
  tenMonHoc: string;
  maMonHoc: string;
  hocKy: string;
  danhSachLop: LopHocPhanData[];
  expanded: boolean;
}

// Enum cho trạng thái giảng dạy
enum TrangThaiGiangDay {
  DANG_GIANG_DAY = 1,
  DA_KET_THUC = 2,
  SAP_DAY = 3,
}

const LectureClass = () => {
  const navigate = useNavigate();

  const [allData, setAllData] = useState<LopHocPhanData[]>([]);
  const [monHocGroups, setMonHocGroups] = useState<MonHocGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [trangThai, setTrangThai] = useState<number>(TrangThaiGiangDay.DANG_GIANG_DAY);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const accessToken = localStorage.getItem("accessTokenGV") || "";

  // Hàm xác định trạng thái lớp học
  const getTrangThaiLop = (thoiGianBatDau: string, thoiGianKetThuc: string): number => {
    const now = new Date();
    const batDau = new Date(thoiGianBatDau);
    const ketThuc = new Date(thoiGianKetThuc);

    if (now < batDau) {
      return TrangThaiGiangDay.SAP_DAY;
    } else if (now >= batDau && now <= ketThuc) {
      return TrangThaiGiangDay.DANG_GIANG_DAY;
    } else {
      return TrangThaiGiangDay.DA_KET_THUC;
    }
  };

  // API 1: Fetch toàn bộ dữ liệu
  const fetchAllLopHocPhan = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:3000/lop-hoc-phan/giang-vien", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        throw new Error("Lỗi khi tải dữ liệu");
      }

      const response: ApiResponse = await res.json();
      setAllData(response.data);
      filterAndGroupFromAllData(response.data);
    } catch (error) {
      console.error("Lỗi fetch tất cả lớp học phần:", error);
    } finally {
      setLoading(false);
    }
  };

  // API 2: Fetch với tìm kiếm
  const fetchSearchLopHocPhan = async () => {
    try {
      setLoading(true);
      setMonHocGroups([]);
      
      const skip = (currentPage - 1) * limit;
      
      const params = new URLSearchParams({
        tenMonHoc: searchValue.trim(),
        "giang-day": trangThai.toString(),
        skip: skip.toString(),
        limit: limit.toString(),
      });

      const url = `http://localhost:3000/lop-hoc-phan/giang-vien?${params.toString()}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        throw new Error("Lỗi khi tìm kiếm");
      }

      const response: ApiResponse = await res.json();
      setTotalPages(response.totalPages);
      const grouped = groupByMonHoc(response.data);
      setMonHocGroups(grouped);
    } catch (error) {
      console.error("Lỗi tìm kiếm lớp học phần:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter và group từ allData
  const filterAndGroupFromAllData = (data: LopHocPhanData[]) => {
    let filtered = data;

    filtered = filtered.filter((lop) => {
      const trangThaiLop = getTrangThaiLop(lop.thoigianbatdau, lop.thoigianketthuc);
      return trangThaiLop === trangThai;
    });

    const grouped = groupByMonHoc(filtered);
    setMonHocGroups(grouped);
    setTotalPages(Math.ceil(filtered.length / limit));
  };

  // Nhóm các lớp theo môn học
  const groupByMonHoc = (data: LopHocPhanData[]): MonHocGroup[] => {
    const map = new Map<string, MonHocGroup>();

    data.forEach((lop) => {
      const key = `${lop.mamonhoc}_${lop.hocky}`;
      
      if (!map.has(key)) {
        map.set(key, {
          tenMonHoc: lop.tenmonhoc,
          maMonHoc: lop.mamonhoc,
          hocKy: lop.hocky,
          danhSachLop: [],
          expanded: false, // Mặc định là collapsed
        });
      }

      map.get(key)!.danhSachLop.push(lop);
    });

    return Array.from(map.values());
  };

  // Toggle expand/collapse
  const toggleExpand = (index: number) => {
    setMonHocGroups((prev) =>
      prev.map((group, i) =>
        i === index ? { ...group, expanded: !group.expanded } : group
      )
    );
  };

  // Handle thay đổi trạng thái
  const handleTrangThaiChange = (event: SelectChangeEvent<number>) => {
    setTrangThai(event.target.value as number);
    setCurrentPage(1);
  };

  // Handle tìm kiếm
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
    setCurrentPage(1);
  };

  // Handle phân trang
  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  // Get label cho trạng thái
  const getTrangThaiLabel = (status: number) => {
    switch (status) {
      case TrangThaiGiangDay.DANG_GIANG_DAY:
        return "Đang giảng dạy";
      case TrangThaiGiangDay.DA_KET_THUC:
        return "Đã kết thúc";
      case TrangThaiGiangDay.SAP_DAY:
        return "Sắp dạy";
      default:
        return "";
    }
  };

  // Get color cho chip trạng thái
  const getTrangThaiColor = (status: number): "success" | "error" | "warning" => {
    switch (status) {
      case TrangThaiGiangDay.DANG_GIANG_DAY:
        return "success";
      case TrangThaiGiangDay.DA_KET_THUC:
        return "error";
      case TrangThaiGiangDay.SAP_DAY:
        return "warning";
      default:
        return "success";
    }
  };

  // Fetch data ban đầu
  useEffect(() => {
    if (accessToken) {
      fetchAllLopHocPhan();
    }
  }, []);

  // Khi trạng thái thay đổi
  useEffect(() => {
    if (searchValue.trim()) {
      fetchSearchLopHocPhan();
    } else {
      filterAndGroupFromAllData(allData);
    }
  }, [trangThai]);

  // Debounce cho search
  useEffect(() => {
    if (!accessToken) return;

    if (searchValue.trim()) {
      const timeoutId = setTimeout(() => {
        fetchSearchLopHocPhan();
      }, 500);

      return () => clearTimeout(timeoutId);
    } else {
      filterAndGroupFromAllData(allData);
    }
  }, [searchValue]);

  // Khi phân trang thay đổi
  useEffect(() => {
    if (searchValue.trim() && accessToken) {
      fetchSearchLopHocPhan();
    }
  }, [currentPage]);

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", p: 0 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
          <Typography variant="h3" sx={{ fontWeight: "bold", fontSize: "30px", color: "black" }}>
            Lớp học của tôi
          </Typography>
        </Box>

        {/* Toolbar - Tìm kiếm và Filter */}
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={2}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
            <TextField
              placeholder="Tìm kiếm theo tên môn học..."
              value={searchValue}
              onChange={handleSearch}
              sx={{
                width: "30vw",
                minWidth: "300px",
                backgroundColor: "white",
                borderRadius: 2,
              }}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <Select
              value={trangThai}
              onChange={handleTrangThaiChange}
              sx={{
                minWidth: 200,
                backgroundColor: "white",
                borderRadius: 2,
              }}
              size="small"
            >
              <MenuItem value={TrangThaiGiangDay.DANG_GIANG_DAY}>
                Đang giảng dạy
              </MenuItem>
              <MenuItem value={TrangThaiGiangDay.DA_KET_THUC}>
                Đã kết thúc
              </MenuItem>
              <MenuItem value={TrangThaiGiangDay.SAP_DAY}>Sắp dạy</MenuItem>
            </Select>
          </Stack>
        </Stack>

        {/* Summary bar */}
        <Stack direction="row" alignItems="center" gap={2}>
          <Typography variant="body2" sx={{ color: "#245D51" }}>
            Tổng số môn học: <b>{monHocGroups.length}</b>
          </Typography>
          {loading && <CircularProgress size={16} />}
        </Stack>

        {/* Danh sách môn học */}
        <Box>
          <Typography sx={{ mb: 2, color: "#245D51" }}>
            Danh sách môn học
          </Typography>
          <Box sx={{ border: "1px solid #ddd", borderRadius: 2, p: 2, backgroundColor: "#fafafa" }}>
            {loading && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress />
              </Box>
            )}
            
            {!loading && monHocGroups.length === 0 && (
              <Typography variant="body2" sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
                Không có lớp học phần nào.
              </Typography>
            )}

            {!loading &&
              monHocGroups.map((group, index) => (
                <Card
                  key={`${group.maMonHoc}_${group.hocKy}_${index}`}
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                    "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.15)" },
                    backgroundColor: "#ffffff",
                  }}
                >
                  {/* Header môn học - Clickable */}
                  <CardContent
                    sx={{
                      p: 2,
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "#f5f5f5" },
                    }}
                    onClick={() => toggleExpand(index)}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Stack direction="row" alignItems="center" spacing={2} flex={1}>
                        <IconButton size="small">
                          {group.expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                        <Box>
                          <Typography
                            sx={{
                              fontSize: "18px",
                              fontWeight: "bold",
                              color: "#333",
                            }}
                          >
                            {group.tenMonHoc}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "#666", mt: 0.5 }}
                          >
                            {group.maMonHoc} • {group.hocKy}
                          </Typography>
                        </Box>
                      </Stack>
                      <Chip
                        label={`${group.danhSachLop.length} lớp`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Stack>
                  </CardContent>

                  {/* Danh sách lớp học phần - Collapse */}
                  <Collapse in={group.expanded}>
                    <Box sx={{ px: 2, pb: 2 }}>
                      <Stack spacing={2} sx={{ pl: 2 }}>
                        {group.danhSachLop.map((lop) => {
                          const trangThaiLop = getTrangThaiLop(
                            lop.thoigianbatdau,
                            lop.thoigianketthuc
                          );
                          
                          return (
                            <Card
                              key={lop.lhp_id}
                              sx={{
                                cursor: "pointer",
                                transition: "all 0.2s",
                                "&:hover": {
                                  boxShadow: 3,
                                  transform: "translateY(-2px)",
                                },
                                borderLeft: "4px solid #1976d2",
                              }}
                              onClick={() =>
                                navigate(`/lecturer/lop-hoc-phan/bai-kiem-tra/${lop.lhp_id}`, {
                                  state: {
                                    tenLopHoc: lop.tenlhp,
                                    tenMonHoc: lop.tenmonhoc,
                                    idMonHoc: lop.mh_id,
                                  },
                                })
                              }
                            >
                              <CardContent sx={{ p: 2 }}>
                                <Stack spacing={2}>
                                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography
                                      sx={{
                                        fontSize: "16px",
                                        fontWeight: "600",
                                        color: "#1976d2",
                                      }}
                                    >
                                      {lop.tenlhp}
                                    </Typography>
                                    <Chip
                                      label={getTrangThaiLabel(trangThaiLop)}
                                      size="small"
                                      color={getTrangThaiColor(trangThaiLop)}
                                    />
                                  </Stack>

                                  <Stack direction="row" spacing={3} flexWrap="wrap">
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <CalendarToday sx={{ fontSize: 16, color: "#666" }} />
                                      <Typography variant="body2" sx={{ color: "#666" }}>
                                        {new Date(lop.thoigianbatdau).toLocaleDateString("vi-VN")}
                                        {" - "}
                                        {new Date(lop.thoigianketthuc).toLocaleDateString("vi-VN")}
                                      </Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <People sx={{ fontSize: 16, color: "#666" }} />
                                      <Typography variant="body2" sx={{ color: "#666" }}>
                                        {lop.siso} sinh viên
                                      </Typography>
                                    </Stack>
                                  </Stack>
                                </Stack>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </Stack>
                    </Box>
                  </Collapse>
                </Card>
              ))}
          </Box>
        </Box>

        {/* Pagination - chỉ hiện khi search */}
        {!loading && searchValue.trim() && totalPages > 1 && (
          <Stack alignItems="center" sx={{ mt: 2 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
            />
          </Stack>
        )}
      </Stack>
    </Box>
  );
};

export default LectureClass;
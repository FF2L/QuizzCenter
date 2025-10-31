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
} from "@mui/material";

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

  const [allData, setAllData] = useState<LopHocPhanData[]>([]); // Data gốc từ API 1
  const [monHocGroups, setMonHocGroups] = useState<MonHocGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [trangThai, setTrangThai] = useState<number>(TrangThaiGiangDay.DANG_GIANG_DAY);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Lấy accessToken từ localStorage
  const accessToken = localStorage.getItem("accessTokenGV") || "";

  // Hàm xác định trạng thái lớp học (dùng cho API 1)
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

  // API 1: Fetch toàn bộ dữ liệu lớp học phần (không có params)
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
      
      // Filter và group ngay sau khi fetch
      filterAndGroupFromAllData(response.data);
    } catch (error) {
      console.error("Lỗi fetch tất cả lớp học phần:", error);
    } finally {
      setLoading(false);
    }
  };

  // API 2: Fetch dữ liệu với tìm kiếm (có params)
  const fetchSearchLopHocPhan = async () => {
    try {
      setLoading(true);
      setMonHocGroups([]); // Clear data cũ
      
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
      console.log("Search API Response:", response);
      setTotalPages(response.totalPages);

      // Nhóm dữ liệu
      const grouped = groupByMonHoc(response.data);
      setMonHocGroups(grouped);
    } catch (error) {
      console.error("Lỗi tìm kiếm lớp học phần:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter và group từ allData (dùng khi không search)
  const filterAndGroupFromAllData = (data: LopHocPhanData[]) => {
    let filtered = data;

    // Lọc theo trạng thái
    filtered = filtered.filter((lop) => {
      const trangThaiLop = getTrangThaiLop(lop.thoigianbatdau, lop.thoigianketthuc);
      return trangThaiLop === trangThai;
    });

    // Nhóm theo môn học
    const grouped = groupByMonHoc(filtered);
    setMonHocGroups(grouped);
    
    // Tính phân trang thủ công (vì không có từ API)
    setTotalPages(Math.ceil(filtered.length / limit));
  };

  // Nhóm các lớp học phần theo môn học
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
          expanded: true,
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

  // Fetch data ban đầu (API 1 - toàn bộ data)
  useEffect(() => {
    if (accessToken) {
      fetchAllLopHocPhan();
    }
  }, []);

  // Khi trạng thái thay đổi
  useEffect(() => {
    if (searchValue.trim()) {
      // Nếu đang search, gọi API search
      fetchSearchLopHocPhan();
    } else {
      // Nếu không search, filter từ allData
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
      // Khi xóa hết search, quay về filter từ allData
      filterAndGroupFromAllData(allData);
    }
  }, [searchValue]);

  // Khi phân trang thay đổi
  useEffect(() => {
    if (searchValue.trim() && accessToken) {
      // Chỉ gọi API khi đang search
      fetchSearchLopHocPhan();
    }
  }, [currentPage]);

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        p: 3,
      }}
    >
      <Typography
        variant="h3"
        sx={{ fontWeight: "medium", fontSize: "30px", color: "black", mb: 4 }}
      >
        Lớp học của tôi
      </Typography>

      {/* Header - Tìm kiếm và Filter */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          placeholder="Tìm kiếm theo tên môn học..."
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
              fontFamily: "Poppins",
            },
          }}
        />

        <Select
          value={trangThai}
          onChange={handleTrangThaiChange}
          sx={{
            width: "200px",
            height: "50px",
            backgroundColor: "white",
            "& .MuiSelect-select": {
              fontSize: "16px",
              fontWeight: "medium",
              fontFamily: "Poppins",
            },
          }}
        >
          <MenuItem value={TrangThaiGiangDay.DANG_GIANG_DAY}>
            Đang giảng dạy
          </MenuItem>
          <MenuItem value={TrangThaiGiangDay.DA_KET_THUC}>
            Đã kết thúc
          </MenuItem>
          <MenuItem value={TrangThaiGiangDay.SAP_DAY}>Sắp dạy</MenuItem>
        </Select>
      </Box>

      {/* Nội dung */}
      <Stack spacing={3}>
        {loading && <Typography>Đang tải...</Typography>}
        
        {!loading && monHocGroups.length === 0 && (
          <Typography>Không có lớp học phần nào.</Typography>
        )}

        {!loading &&
          monHocGroups.map((group, index) => (
            <Box key={`${group.maMonHoc}_${group.hocKy}_${index}`}>
              {/* Header môn học */}
              <Card
                sx={{
                  backgroundColor: "#f5f5f5",
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "#eeeeee" },
                }}
                onClick={() => toggleExpand(index)}
              >
                <CardContent sx={{ p: 2 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography
                      sx={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#333",
                      }}
                    >
                      {group.tenMonHoc} - {group.maMonHoc} - {group.hocKy}
                    </Typography>
                    <IconButton>
                      {group.expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Stack>
                </CardContent>
              </Card>

              {/* Danh sách lớp học phần */}
              <Collapse in={group.expanded}>
                <Stack spacing={2} sx={{ mt: 2, pl: 2 }}>
                  {group.danhSachLop.map((lop) => (
                    <Card
                      key={lop.lhp_id}
                      sx={{
                        cursor: "pointer",
                        "&:hover": { boxShadow: 3 },
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
                      <CardContent sx={{ p: 3, backgroundColor: "white" }}>
                        <Stack spacing={1}>
                          <Typography
                            sx={{
                              fontSize: "20px",
                              fontWeight: "medium",
                              color: "black",
                            }}
                          >
                            {lop.tenlhp}
                          </Typography>
                          <Stack direction="row" spacing={4}>
                            <Typography
                              sx={{ fontSize: "14px", color: "#a5a5a5" }}
                            >
                              Ngày bắt đầu:{" "}
                              {new Date(
                                lop.thoigianbatdau
                              ).toLocaleDateString("vi-VN")}
                            </Typography>
                            <Typography
                              sx={{ fontSize: "14px", color: "#a5a5a5" }}
                            >
                              Ngày kết thúc:{" "}
                              {new Date(
                                lop.thoigianketthuc
                              ).toLocaleDateString("vi-VN")}
                            </Typography>
                            <Typography
                              sx={{ fontSize: "14px", color: "#a5a5a5" }}
                            >
                              Sĩ số: {lop.siso}
                            </Typography>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Collapse>
            </Box>
          ))}

        {/* Phân trang - chỉ hiện khi search */}
        {!loading && searchValue.trim() && totalPages > 1 && (
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
      </Stack>
    </Box>
  );
};

export default LectureClass;
import React, { useState, useEffect, useMemo, useCallback } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Pagination } from "@mui/material";
import { LectureService } from "../../services/lecture.api";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

// Interface cho dữ liệu môn học từ API
interface MonHoc {
  id: number;
  create_at: string;
  update_at: string;
  delete_at: string | null;
  maMonHoc: string;
  tenMonHoc: string;
  idKhoa: number;
}

interface ApiResponse {
  data: MonHoc[];
  total: number;
  currentPage: number;
  totalPages: number;
}

// Component CourseItem để tách riêng và tối ưu
const CourseItem = React.memo(({ course, onNavigate }: { 
  course: MonHoc; 
  onNavigate: (id: number, tenMonHoc: string) => void; 
}) => (
  <Card>
    <CardContent sx={{ p: 3 }}>
      <Stack direction="row" spacing={3} alignItems="center">
        <img 
          src="/assets/Book1.jpg" 
          style={{ height: "100px", width: "200px", borderRadius: "10px" }} 
          alt={course.tenMonHoc}
        />
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h6"
            onClick={() => onNavigate(course.id, course.tenMonHoc)}
            sx={{
              cursor: "pointer",
              fontWeight: 500,
              mb: 1,
              "&:hover": {
                color: "#245d51",
              },
            }}
          >
            {course.tenMonHoc}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "gray" }}
          >
            Mã môn học: {course.maMonHoc}
          </Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
));

function Course() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [monHoc, setMonHoc] = useState<MonHoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [searchType, setSearchType] = useState<'maMon' | 'tenMon'>('maMon');
  const [searchValue, setSearchValue] = useState('');
  const accessToken = localStorage.getItem('accessTokenGV') || '';
  
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Lấy page từ URL params, mặc định là 1
  const currentPage = parseInt(searchParams.get('page') || '1');
  const limit = 10; // Số môn học trên mỗi trang

  const fetchMonHoc = useCallback(async (page: number = 1, searchMaMon?: string, searchTenMon?: string) => {
    if (!accessToken) {
      console.error("No access token found for lecturer.");
      navigate('/login');
      return;
    }
    
    setLoading(true);
    try {
      const res = await LectureService.getAllCourse(
        accessToken, 
        page, 
        limit, 
        searchMaMon, 
        searchTenMon
      );
      
      if (res.ok && res.data) {
        const apiData: ApiResponse = res.data;
        setMonHoc(apiData.data || []);
        setTotalPages(apiData.totalPages || 0);
      } else {
        console.error("API error:", res.error);
        setMonHoc([]);
        setTotalPages(0);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setMonHoc([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [accessToken, navigate, limit]);

  useEffect(() => {
    if (accessToken) {
      fetchMonHoc(currentPage);
    } else {
      navigate('/login');
    }
  }, [currentPage, accessToken, navigate, fetchMonHoc]);

  const handlePageChange = useCallback((event: React.ChangeEvent<unknown>, page: number) => {
    // Cập nhật URL params
    setSearchParams({ page: page.toString() });
  }, [setSearchParams]);

  const handleTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  }, []);

  const handleSearch = useCallback(() => {
    if (searchValue.trim()) {
      if (searchType === 'maMon') {
        fetchMonHoc(1, searchValue.trim(), undefined);
      } else {
        fetchMonHoc(1, undefined, searchValue.trim());
      }
    } else {
      // Nếu không có giá trị tìm kiếm, load lại tất cả
      fetchMonHoc(1);
    }
    // Reset về trang 1 khi tìm kiếm
    setSearchParams({ page: '1' });
  }, [searchValue, searchType, fetchMonHoc, setSearchParams]);

  const handleSearchInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchValue(value);
    if (value === '') {
      // Nếu ô tìm kiếm bị xóa, load lại tất cả
      fetchMonHoc(1);
      setSearchParams({ page: '1' });
    }
  }, [fetchMonHoc, setSearchParams]);

  const handleSearchTypeChange = useCallback((event: any) => {
    setSearchType(event.target.value);
    setSearchValue(''); // Reset search value when changing type
  }, []);

  const handleNavigate = useCallback((id: number, tenMonHoc: string) => {
    navigate(`/lecturer/page/${id}`, { 
      state: { tenMonHoc } 
    });
  }, [navigate]);

  // Memoize course list để chỉ re-render khi monHoc thay đổi
  const courseList = useMemo(() => {
    if (monHoc.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography sx={{ fontSize: 16, color: "gray" }}>
            {searchValue ? 'Không tìm thấy môn học nào' : 'Không có môn học nào'}
          </Typography>
        </Box>
      );
    }

    return (
      <Stack spacing={3}>
        {monHoc.map((course) => (
          <CourseItem 
            key={course.id} 
            course={course} 
            onNavigate={handleNavigate}
          />
        ))}
      </Stack>
    );
  }, [monHoc, searchValue, handleNavigate]);

  // Memoize pagination để chỉ re-render khi totalPages hoặc currentPage thay đổi
  const paginationComponent = useMemo(() => {
    if (totalPages <= 1) return null;

    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
        <Pagination
          count={totalPages}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          size="large"
          sx={{
            "& .MuiPaginationItem-root": {
              fontSize: "16px",
              "&.Mui-selected": {
                backgroundColor: "#245d51",
                color: "white",
                "&:hover": {
                  backgroundColor: "#1e4d42",
                },
              },
              "&:hover": {
                backgroundColor: "#f0f0f0",
              },
            },
          }}
        />
      </Box>
    );
  }, [totalPages, currentPage, handlePageChange]);

  // Hiển thị loading
  if (loading) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography>Đang tải dữ liệu...</Typography>
      </Box>
    );
  }

  // Hiển thị khi không có access token
  if (!accessToken) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography>Đang chuyển hướng đến trang đăng nhập...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "white",
        borderRadius: "10px",
        p: 2,
      }}
    >
      <Stack spacing={3} sx={{ maxWidth: 1582, mx: "auto" }}>
        {/* Navigation Tabs - Ít khi thay đổi nên không cần memo */}
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          sx={{
            "& .MuiTabs-indicator": {
              display: "none",
            },
          }}
        >
          <Tab
            label={
              <Typography
                sx={{
                  color: selectedTab === 0 ? "white" : "black",
                  fontFamily: "Poppins, Helvetica",
                  fontWeight: 500,
                  fontSize: "20px",
                  textTransform: "none",
                }}
              >
                Các môn học
              </Typography>
            }
            sx={{
              backgroundColor: selectedTab === 0 ? "#245d51" : "#e7e7e7",
              minHeight: 56,
              minWidth: 200,
              mr: 2,
              "&:hover": {
                backgroundColor: selectedTab === 0 ? "#245d51" : "#d0d0d0",
              },
            }}
          />
        </Tabs>

        {/* Search Section */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ pt: 4 }}>
          {/* Dropdown chọn loại tìm kiếm */}
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Tìm theo</InputLabel>
            <Select
              value={searchType}
              label="Tìm theo"
              onChange={handleSearchTypeChange}
              sx={{
                height: "45px",
                backgroundColor: "#f5f5f5",
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
              }}
            >
              <MenuItem value="maMon">Mã môn</MenuItem>
              <MenuItem value="tenMon">Tên môn</MenuItem>
            </Select>
          </FormControl>

          {/* Ô tìm kiếm */}
          <TextField
            placeholder={`Nhập ${searchType === 'maMon' ? 'mã môn học' : 'tên môn học'}...`}
            value={searchValue}
            onChange={handleSearchInputChange}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            sx={{
              width: "350px",
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#e7e7e7",
                height: "45px",
                border: "none",
                "& fieldset": {
                  border: "none",
                },
                "& input": {
                  fontFamily: "Product Sans, Helvetica",
                  fontWeight: "bold",
                  fontSize: "16px",
                  color: "#333",
                },
              },
            }}
          />

          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            sx={{
              backgroundColor: "#245d51",
              height: "45px",
              width: "130px",
              fontFamily: "Poppins, Helvetica",
              fontWeight: "medium",
              fontSize: "16px",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#1e4d42",
              },
            }}
          >
            Tìm kiếm
          </Button>
        </Stack>

        {/* Course List - Đã được memoize */}
        <Box
          sx={{
            borderRadius: "10px",
            p: 4,
          }}
        >
          <Typography sx={{ fontSize: 20, mb: 3 }}>Các môn học</Typography>
          {courseList}
        </Box>

        {/* Pagination - Đã được memoize */}
        {paginationComponent}
      </Stack>
    </Box>
  );
}

export default Course;
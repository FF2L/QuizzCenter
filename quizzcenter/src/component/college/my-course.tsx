// src/page/system/college/my-course.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box, Stack, Paper, Typography, Pagination, Skeleton,
  TextField, MenuItem, Select, InputLabel, FormControl, Alert
} from "@mui/material";
import { LopHocPhanApi, LopHocPhanItem } from "../../services/lop-hoc-phan.api";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 10;

const RowSkeleton = () => (
  <Paper sx={{ p: 2, mb: 1.5 }}>
    <Stack direction="row" alignItems="center" spacing={2}>
      <Skeleton variant="rounded" width={180} height={100} />
      <Box sx={{ flex: 1 }}>
        <Skeleton width="60%" />
        <Skeleton width="40%" />
        <Skeleton width="90%" />
        <Skeleton width="20%" />
      </Box>
      <Skeleton variant="circular" width={24} height={24} />
    </Stack>
  </Paper>
);

type FilterKey = "all" | "tenmonhoc" | "mamonhoc";

const CollegeMyCourse: React.FC = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // dữ liệu
  const [rows, setRows] = useState<LopHocPhanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // tìm kiếm
  const [filterType, setFilterType] = useState<FilterKey>("all");
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const justChangedFilterRef = useRef(false);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchText.trim()), 300);
    return () => clearTimeout(t);
  }, [searchText]);

  // đổi filter/search → về trang 1
  useEffect(() => {
    justChangedFilterRef.current = true;
    setPage(1);
  }, [filterType, debouncedSearch]);

  // fetch list với accessToken
  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        setError(null);
        
        // Tính skip theo page hiện tại
        const skip = (page - 1) * PAGE_SIZE;

        if (rows.length === 0 || justChangedFilterRef.current) setLoading(true);

        // Xử lý search term theo filter type
        const term = debouncedSearch || undefined;
        const tenParam = (filterType === "tenmonhoc" || filterType === "all") ? term : undefined;
        const maParam = (filterType === "mamonhoc" || filterType === "all") ? term : undefined;

        // Gọi API - accessToken tự động được thêm vào header từ ApiClient
        const response = await LopHocPhanApi.layDanhSachLopHocPhanCuaSinhVien(
          skip,
          PAGE_SIZE,
          tenParam,
          maParam
        );

        if (!ignore) {
          // Lấy data từ response.data
          const dataArray = response.data || [];
          
          setRows(dataArray);
          setTotal(response.total || 0);
          setTotalPages(response.totalPages || 1);
          setLoading(false);
        }
        
        justChangedFilterRef.current = false;
      } catch (e: any) {
        console.error('Error fetching courses:', e);
        
        if (!ignore) {
          setLoading(false);
          
          // Xử lý lỗi authentication
          if (e.message === 'Unauthorized: Access token is required') {
            setError("Bạn chưa đăng nhập. Vui lòng đăng nhập để xem danh sách lớp học phần.");
            // Redirect về trang login sau 2 giây
            setTimeout(() => {
              navigate('/login');
            }, 2000);
          } else if (e.response?.status === 401) {
            setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            setTimeout(() => {
              navigate('/login');
            }, 2000);
          } else if (e.response?.status === 403) {
            setError("Bạn không có quyền truy cập.");
          } else {
            setError("Không thể tải danh sách lớp học phần. Vui lòng thử lại.");
          }
        }
        
        justChangedFilterRef.current = false;
      }
    })();

    return () => { ignore = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterType, debouncedSearch]);

  const hasRows = Array.isArray(rows) && rows.length > 0;

  return (
    <Box sx={{ flex: 1, pt: "40px", px: { xs: 2, md: 3 }, pb: 4, minHeight: "70vh" }}>
      {/* Bộ lọc & tìm kiếm */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ color: "#ff6a00", fontWeight: 600, mb: 1.5 }}>
          Tổng quan về khóa học {total > 0 && `(${total})`}
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel id="filter-label">Tìm theo</InputLabel>
            <Select
              labelId="filter-label"
              value={filterType}
              label="Tìm theo"
              onChange={(e) => setFilterType(e.target.value as FilterKey)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="tenmonhoc">Tên môn học</MenuItem>
              <MenuItem value="mamonhoc">Mã môn học</MenuItem>
            </Select>
          </FormControl>

          <TextField
            variant="outlined"
            size="small"
            placeholder={
              filterType === "mamonhoc"
                ? "Tìm theo mã môn học…"
                : filterType === "tenmonhoc"
                ? "Tìm theo tên môn học…"
                : "Tìm theo tên hoặc mã môn học…"
            }
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ flex: 1, minWidth: 240 }}
          />
        </Stack>
      </Paper>

      {/* Hiển thị lỗi nếu có */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Danh sách */}
      {loading && !hasRows ? (
        Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)
      ) : !hasRows ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            {debouncedSearch 
              ? "Không tìm thấy lớp học phần nào phù hợp."
              : "Bạn chưa có lớp học phần nào."
            }
          </Typography>
        </Paper>
      ) : (
        rows.map((r) => (
          <Paper 
            key={r.lhp_id} 
            sx={{ 
              p: 2, 
              mb: 1.5,
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-2px)'
              }
            }} 
            onClick={() => navigate(`/quizzcenter/course/test/${r.lhp_id}`, {
              state: {
                tenMonHoc: r.tenmonhoc,
                maMonHoc: r.mamonhoc
              }
            })}
          >
            <Stack direction="row" alignItems="flex-start" spacing={2}>
              <Box sx={{ flex: 1, pr: 1 }}>
                <Typography variant="subtitle1" sx={{ color: "#ff6a00", fontWeight: 600, mb: 0.5 }}>
                  {r.tenmonhoc} ({r.mamonhoc})
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>
                  <b>{r.hocky}</b>
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>
                  Lớp: <b>{r.tenlhp}</b>
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  {new Date(r.thoigianbatdau).toLocaleDateString('vi-VN')} - {new Date(r.thoigianketthuc).toLocaleDateString('vi-VN')}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        ))
      )}

      {/* Phân trang */}
      {hasRows && totalPages > 1 && (
        <Stack direction="row" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => setPage(p)}
            color="primary"
            shape="rounded"
          />
        </Stack>
      )}
    </Box>
  );
};

export default CollegeMyCourse;
// src/page/system/college/my-course.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box, Stack, Paper, Typography, IconButton, Pagination, Skeleton,
  TextField, MenuItem, Select, InputLabel, FormControl
} from "@mui/material";
import { LopHocPhanApi, LopHocPhanItem } from "../../api/lop-hoc-phan.api";
import { useNavigate } from "react-router-dom";


const PAGE_SIZE = 10;



// const Thumbnail = () => (
//   <Box sx={{
//     width: 180, height: 100, borderRadius: 1.5,
//     background:
//       "repeating-linear-gradient(45deg,#a8c0ff,#a8c0ff 10px,#3f2b96 10px,#3f2b96 20px)",
//     mr: 2, flexShrink: 0,
//   }}/>
// );

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
  // phân trang
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  // dữ liệu
  const [rows, setRows] = useState<LopHocPhanItem[]>([]);
  const [loading, setLoading] = useState(true);

  // tìm kiếm
  const [filterType, setFilterType] = useState<FilterKey>("all"); // ✅ mặc định All
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

  // fetch list (không dùng API count)
  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        const skip = (page - 1) * PAGE_SIZE;
        const limitPlus = PAGE_SIZE + 1;

        if (rows.length === 0 || justChangedFilterRef.current) setLoading(true);

        const term = debouncedSearch || undefined;
        const tenParam =
          filterType === "tenmonhoc" ? term :
          filterType === "all" ? term : undefined;
        const maParam =
          filterType === "mamonhoc" ? term :
          filterType === "all" ? term : undefined;

        const data = await LopHocPhanApi.layDanhSachLopHocPhanCuaSinhVien(
          skip, limitPlus, tenParam, maParam
        );

        const arr: LopHocPhanItem[] = Array.isArray(data) ? data : [];
        const next = arr.length > PAGE_SIZE;
        const pageData = next ? arr.slice(0, PAGE_SIZE) : arr;

        // nếu trang mới rỗng → giữ UI, không render gì thêm
        if (pageData.length === 0 && page > 1) {
          if (!ignore) setLoading(false);
          justChangedFilterRef.current = false;
          return;
        }

        if (!ignore) {
          setRows(pageData);
          setHasNext(next);
          setLoading(false);
        }
        justChangedFilterRef.current = false;
      } catch (e) {
        console.error(e);
        if (!ignore) setLoading(false);
        justChangedFilterRef.current = false;
      }
    })();

    return () => { ignore = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterType, debouncedSearch]);

  const pageCount = useMemo(() => page + (hasNext ? 1 : 0), [page, hasNext]);
  const hasRows = Array.isArray(rows) && rows.length > 0;

  return (
    <Box sx={{ flex: 1, pt: "40px", px: { xs: 2, md: 3 }, pb: 4, minHeight: "70vh" }}>
      {/* Bộ lọc & tìm kiếm */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ color: "#ff6a00", fontWeight: 600, mb: 1.5 }}>
          Tổng quan về khóa học
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
              {/* ✅ All mặc định */}
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

      {/* Danh sách: ✅ nếu mảng rỗng thì KHÔNG render gì */}
      {loading && !hasRows
        ? Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i} />)
        : hasRows &&
          rows.map((r) => (
            <Paper 
    key={r.lhp_id} 
    sx={{ p: 2, mb: 1.5 }} 
    onClick={() => navigate(`/quizzcenter/course/test/${r.lhp_id}`, {
      state: {
        tenMonHoc: r.tenmonhoc,
        maMonHoc: r.mamonhoc
      }
    })}
  >
              <Stack direction="row" alignItems="flex-start" spacing={2}>
                {/* <Thumbnail /> */}
                <Box sx={{ flex: 1, pr: 1 }}>
                  <Typography variant="subtitle1" sx={{ color: "#ff6a00", fontWeight: 600, mb: 0.5 }}>
                    {r.tenmonhoc} ({r.mamonhoc})
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    <b>{r.hocky}</b>
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    Lớp học {r.tenmonhoc} ({r.mamonhoc}), {r.hocky} được mở cho lớp {r.tenlhp}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          ))
      }

      {/* Phân trang: ✅ ẩn khi mảng rỗng */}
      {hasRows && (
        <Stack direction="row" justifyContent="center" mt={3}>
          <Pagination
            count={pageCount}
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

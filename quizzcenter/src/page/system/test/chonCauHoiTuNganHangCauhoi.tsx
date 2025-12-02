import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import {
  Box,
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Card,
  CardContent,
  Stack,
  Button,
  IconButton,
  Chip,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";
import { LectureService } from "../../../services/lecture.api";

interface Chuong {
  id: number;
  tenchuong: string;
}

interface CauHoi {
  id: number;
  tenHienThi: string;
  noiDungCauHoi: string;
  noiDungCauHoiHTML: string;
  loaiCauHoi: string;
  doKho: string;
  idChuong: number;
}

interface CauHoiDetail {
  cauHoi: CauHoi;
  dapAn: Array<{
    id: number;
    create_at: string;
    update_at: string;
    delete_at: string | null;
    noiDung: string;
    noiDungHTML: string | null;
    dapAnDung: boolean;
    publicId: string | null;
    idCauHoi: number;
  }>;
}

interface CauHoiDetailWithChuong extends CauHoiDetail {
  tenchuong?: string;
}

export default function SelectFromBankPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    idBaiKiemTra?: number;
    idMonHoc:number;
    tenMonHoc?: string;
    tenBaiKiemTra?: string;
  };

  const idBaiKiemTra = state?.idBaiKiemTra;
  const idMonHoc = state?.idMonHoc;
  const tenMonHoc = state?.tenMonHoc || "";
  const tenBaiKiemTra = state?.tenBaiKiemTra || "";
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedChuongName, setSelectedChuongName] = useState("");

  const [chuongList, setChuongList] = useState<Chuong[]>([]);
  const [selectedChuong, setSelectedChuong] = useState<number | "">("");
  const [cauHoiList, setCauHoiList] = useState<CauHoi[]>([]);
  const [loading, setLoading] = useState(false);

  // Trạng thái câu hỏi "đang có trong đề" hiện tại (state hiển thị)
  const [cauHoiDaCoTrongDe, setCauHoiDaCoTrongDe] = useState<Set<number>>(new Set());
  // Snapshot gốc để so sánh khi lưu / rời trang
  const [cauHoiDaCoTrongDeGoc, setCauHoiDaCoTrongDeGoc] = useState<Set<number>>(new Set());
  // Map idCauHoi -> idChiTiet (để xoá từng item trên BE)
  const [mapChiTietByCauHoiId, setMapChiTietByCauHoiId] = useState<Map<number, number>>(new Map());

  // Dialog chi tiết
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedCauHoi, setSelectedCauHoi] = useState<CauHoiDetailWithChuong | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [searchDebounce, setSearchDebounce] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Dialog confirm bỏ thay đổi
  const [openConfirmBack, setOpenConfirmBack] = useState(false);

  // Dialog thông báo lỗi/thành công
  const [openMessage, setOpenMessage] = useState(false);
  const [message, setMessage] = useState("");
  const accessToken = localStorage.getItem("accessTokenGV") || "";
  const [tongSoCau, setTongSoCau] = useState(0);


  const [filters, setFilters] = useState({
    searchText: '',
    loaiCauHoi: 'all',
    doKho: 'all',
    trangThai: 'all'
  });

  // ========== Fetch danh sách chương ==========
  useEffect(() => {
    const fetchChuong = async () => {
      if (!idMonHoc) return;
      setLoading(true);
      try {
        const res = await LectureService.layTatCaChuongTheoMonHoc(idMonHoc, accessToken);
        const data: Chuong[] = res.data;
        setChuongList(data);

        const defaultChuong = location.state?.idChuong
          ? data.find((c) => c.id === Number(location.state.idChuong))
          : data[0];
        if (defaultChuong) {
          setSelectedCategory(String(defaultChuong.id));
          setSelectedChuongName(defaultChuong.tenchuong);
          setSelectedChuong(defaultChuong.id);
        }
      } catch (err) {
        console.error("Lỗi khi fetch chương:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChuong();
  }, [idMonHoc, location.state, accessToken]);

  // ========== Fetch câu hỏi đã có trong đề (snapshot gốc + map chi tiết) ==========
  useEffect(() => {
    const fetchCauHoiTrongDe = async () => {
      if (!idBaiKiemTra) return;

      try {
        const res = await fetch(
          `${process.env.REACT_APP_BACK_END_URL}/bai-kiem-tra/${idBaiKiemTra}/chi-tiet-cau-hoi?skip=0&limit=10000`
        );
        if (!res.ok) throw new Error("Không thể tải câu hỏi trong đề");
        const databefore = await res.json();
        const data = databefore.data;

        const idSet = new Set<number>();
        const mapping = new Map<number, number>();

        if (Array.isArray(data)) {
          console.log("Câu hỏi trong đề:", data);
          data.forEach((item: any) => {
            if (item.idCauHoi) {
              idSet.add(item.idCauHoi);
              if (item.id) mapping.set(item.idCauHoi, item.id);
            }
          });
        }
        setCauHoiDaCoTrongDe(idSet);
        setCauHoiDaCoTrongDeGoc(new Set(idSet));
        setMapChiTietByCauHoiId(mapping);
      } catch (error) {
        console.error("Lỗi khi tải câu hỏi trong đề:", error);
      }
    };

    fetchCauHoiTrongDe();
  }, [idBaiKiemTra]);

  // ========== Debounce search ==========
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(filters.searchText);
    }, 500);
  
    return () => clearTimeout(timer);
  }, [filters.searchText]);

  // ========== Reset page khi filter thay đổi ==========
  useEffect(() => {
    setPage(1);
  }, [filters.loaiCauHoi, filters.doKho, filters.trangThai, searchDebounce, selectedChuong]);

  // ========== Fetch câu hỏi theo chương + filter + trang ==========
// ========== Fetch câu hỏi theo chương + filter + trang ==========
useEffect(() => {
  const fetchCauHoi = async () => {
    if (!selectedChuong) return;
    try {
      setLoading(true);

      // ✅ Chuẩn bị params cho API
      const doKhoParam = filters.doKho !== 'all' ? filters.doKho : undefined;
      const searchParam = searchDebounce || undefined;
      
      // ✅ Nếu filter theo trạng thái, lấy tất cả để filter client
      const isFilteringByStatus = filters.trangThai !== 'all';
      const limitParam = isFilteringByStatus ? 10000 : limit;
      const pageParam = isFilteringByStatus ? 1 : page;

      const res = await LectureService.layTatCauHoiTheoChuong(
        accessToken,
        selectedChuong,
        pageParam,
        limitParam,
        doKhoParam,
        searchParam
      );

      if (res.ok) {
        const data = res.data;
        if (Array.isArray(data.data) && typeof data.total === "number") {
          let list = data.data;
          
          // ✅ Lưu tổng số câu gốc từ API
          const totalFromAPI = data.total;
          
          // ✅ Lọc theo loại câu hỏi (client-side vì API có thể không hỗ trợ)
          if (filters.loaiCauHoi !== 'all') {
            list = list.filter((q: any) => q.loaiCauHoi === filters.loaiCauHoi);
          }

          // ✅ Lọc theo trạng thái (client-side vì BE không biết state)
          if (filters.trangThai !== 'all') {
            list = list.filter((q: any) => {
              const daChon = cauHoiDaCoTrongDe.has(q.id);
              if (filters.trangThai === 'dachon') return daChon;
              if (filters.trangThai === 'chuachon') return !daChon;
              return true;
            });
          }
          
          // ✅ Sắp xếp theo ID giảm dần (mới nhất trước)
          list.sort((a: any, b: any) => b.id - a.id);

          // ✅ Nếu đang filter theo trạng thái hoặc loại câu hỏi, cập nhật tổng số sau khi filter
          if (isFilteringByStatus || filters.loaiCauHoi !== 'all') {
            const totalFiltered = list.length;
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            list = list.slice(startIndex, endIndex);
            setTotalPages(Math.ceil(totalFiltered / limit));
            setTongSoCau(totalFiltered); // ✅ Tổng số sau khi filter
          } else {
            setTotalPages(Math.ceil(totalFromAPI / limit));
            setTongSoCau(totalFromAPI); // ✅ Tổng số từ API
          }
          
          setCauHoiList(list);
        } else {
          setCauHoiList([]);
          setTotalPages(1);
          setTongSoCau(0);
        }
      } else {
        console.error("Lỗi khi tải câu hỏi:", res.error);
        alert("Không thể tải danh sách câu hỏi!");
        setCauHoiList([]);
        setTotalPages(1);
        setTongSoCau(0);
      }
    } catch (error) {
      console.error("Lỗi khi tải câu hỏi:", error);
      alert("Không thể tải danh sách câu hỏi!");
      setCauHoiList([]);
      setTotalPages(1);
      setTongSoCau(0);
    } finally {
      setLoading(false);
    }
  };

  fetchCauHoi();
}, [selectedChuong, page, accessToken, filters.doKho, filters.loaiCauHoi, filters.trangThai, searchDebounce, cauHoiDaCoTrongDe, limit]);

  // ========== Helpers ==========
  const hasUnsavedChanges = () => {
    if (cauHoiDaCoTrongDe.size !== cauHoiDaCoTrongDeGoc.size) return true;
    
    for (const id of Array.from(cauHoiDaCoTrongDe)) {
      if (!cauHoiDaCoTrongDeGoc.has(id)) return true;
    }
    return false;
  };

  const getChuongName = (idChuong: number): string => {
    const chuong = chuongList.find((c) => c.id === idChuong);
    return chuong?.tenchuong || `Chương ${idChuong}`;
  };

  // ========== Điều hướng quay lại (không lưu) ==========
  const handleBack = () => {
    if (hasUnsavedChanges()) {
      setOpenConfirmBack(true);
    } else {
      // SỬA: Navigate trực tiếp về đường dẫn cụ thể thay vì navigate(-1)
      navigate(`/lecturer/bai-kiem-tra/${idBaiKiemTra}`, {
        state: { idBaiKiemTra, idMonHoc, tenMonHoc, tenBaiKiemTra },
        replace: true // Thay thế history thay vì thêm mới
      });
    }
  };
  
  const confirmBack = () => {
    setOpenConfirmBack(false);
    // SỬA: Navigate trực tiếp về đường dẫng cụ thể với replace: true
    navigate(`/lecturer/bai-kiem-tra/${idBaiKiemTra}`, {
      state: { idBaiKiemTra, idMonHoc, tenMonHoc, tenBaiKiemTra },
      replace: true
    });
  };

  // ========== Xem chi tiết câu hỏi ==========
  const handleViewDetail = async (idCauHoi: number) => {
    try {
      setLoadingDetail(true);
      const res = await LectureService.layChiTIetCauHoi(accessToken, idCauHoi);
      console.log("Response:", res);
      
      if (!res.ok) throw new Error("Không thể tải chi tiết câu hỏi");
      
      const data: CauHoiDetail = res.data;
  
      const chuong = chuongList.find((c) => c.id === data.cauHoi.idChuong);
      const tenchuong = chuong ? chuong.tenchuong : `Chương ${data.cauHoi.idChuong}`;
  
      setSelectedCauHoi({ ...data, tenchuong });
      setOpenDetail(true);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết:", error);
      alert("Không thể tải chi tiết câu hỏi!");
    } finally {
      setLoadingDetail(false);
    }
  };

  // ========== Toggle chọn câu hỏi (CHỈ đổi state, KHÔNG gọi API) ==========
  const handleToggleCauHoi = (
    idCauHoi: number,
    daCoTrongDe: boolean,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();

    if (daCoTrongDe) {
      setCauHoiDaCoTrongDe((prev) => {
        const ns = new Set(prev);
        ns.delete(idCauHoi);
        return ns;
      });
    } else {
      setCauHoiDaCoTrongDe((prev) => {
        const ns = new Set(prev);
        ns.add(idCauHoi);
        return ns;
      });
    }
  };

  // ========== Áp dụng thay đổi khi bấm "Hoàn thành" (GỌI API 1 LẦN) ==========
  const applyChanges = async () => {
    const toAdd: number[] = [];
    const toRemoveChiTietIds: number[] = [];

    cauHoiDaCoTrongDe.forEach((id) => {
      if (!cauHoiDaCoTrongDeGoc.has(id)) toAdd.push(id);
    });

    cauHoiDaCoTrongDeGoc.forEach((id) => {
      if (!cauHoiDaCoTrongDe.has(id)) {
        const chiTietId = mapChiTietByCauHoiId.get(id);
        if (chiTietId) toRemoveChiTietIds.push(chiTietId);
      }
    });

    if (toAdd.length > 0) {
      const res = await fetch(`${process.env.REACT_APP_BACK_END_URL}/bai-kiem-tra/chi-tiet-cau-hoi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idBaiKiemTra, mangIdCauHoi: toAdd }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Thêm câu hỏi thất bại");
      }
    }

    if (toRemoveChiTietIds.length > 0) {
      await Promise.all(
        toRemoveChiTietIds.map((id) =>
          fetch(`${process.env.REACT_APP_BACK_END_URL}/bai-kiem-tra/chi-tiet-cau-hoi/${id}`, {
            method: "DELETE",
          }).then(async (r) => {
            if (!r.ok) {
              const t = await r.text();
              throw new Error(t || `Xoá chi tiết ${id} thất bại`);
            }
          })
        )
      );
    }

    setCauHoiDaCoTrongDeGoc(new Set(cauHoiDaCoTrongDe));
  };

  // ========== Hoàn thành: lưu rồi quay lại ==========
  const handleComplete = async () => {
    try {
      await applyChanges();
      setMessage("Lưu thay đổi thành công!");
      setOpenMessage(true);
      
      // SỬA: Sử dụng replace: true để không thêm vào history
      setTimeout(() => {
        navigate(`/lecturer/bai-kiem-tra/${idBaiKiemTra}`, {
          state: { idBaiKiemTra, idMonHoc, tenMonHoc, tenBaiKiemTra },
          replace: true
        });
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setMessage("Lưu thay đổi thất bại: " + (err?.message || "Không rõ lỗi"));
      setOpenMessage(true);
    }
  };

  // ========== Cảnh báo đóng tab nếu có thay đổi ==========
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cauHoiDaCoTrongDe, cauHoiDaCoTrongDeGoc]);

  return (
    <Container sx={{ backgroundColor:'#F8F9FA', py: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5">Chọn câu hỏi từ ngân hàng</Typography>
      </Box>

      <Box sx={{ backgroundColor: "white", p: 3, borderRadius: 2, mb: 3 }}>
        <Box
          sx={{
            flexDirection: "row",
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
            mb: 3,
          }}
        >
          <Typography sx={{ fontWeight: "bold", fontSize: "18px" }}>
            Môn học:
          </Typography>
          <Box
            sx={{
              borderRadius: "10px",
              height: "30px",
              px: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography
              sx={{ color: "rgba(255, 0, 0, 1)", fontWeight: "bold", fontSize: "18px" }}
            >
              {tenMonHoc}
            </Typography>
          </Box>
          <Typography sx={{ fontWeight: "bold", fontSize: "18px" }}>→</Typography>
          <Box
            sx={{
              borderRadius: "10px",
              height: "30px",
              px: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography sx={{ color: "#007CD5", fontWeight: "bold", fontSize: "18px" }}>
              {tenBaiKiemTra}
            </Typography>
          </Box>
          <Typography sx={{ fontWeight: "bold", fontSize: "18px" }}>
            → Ngân hàng câu hỏi
          </Typography>
        </Box>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Chọn chương</InputLabel>
          <Select
            value={selectedChuong}
            onChange={(e) => setSelectedChuong(Number(e.target.value))}
            label="Chọn chương"
          >
            {chuongList.map((chuong) => (
              <MenuItem key={chuong.id} value={chuong.id}>
                {chuong.tenchuong}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm câu hỏi theo tên hoặc nội dung..."
              value={filters.searchText}
              onChange={(e) => setFilters({...filters, searchText: e.target.value})}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: filters.searchText && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setFilters({...filters, searchText: ''})}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Stack>

          <Stack direction="row" spacing={2} flexWrap="wrap">
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Loại câu hỏi</InputLabel>
              <Select
                value={filters.loaiCauHoi}
                onChange={(e) => setFilters({...filters, loaiCauHoi: e.target.value})}
                label="Loại câu hỏi"
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="MotDung">Một đáp án</MenuItem>
                <MenuItem value="NhieuDung">Nhiều đáp án</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Độ khó</InputLabel>
              <Select
                value={filters.doKho}
                onChange={(e) => setFilters({...filters, doKho: e.target.value})}
                label="Độ khó"
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="De">Dễ</MenuItem>
                <MenuItem value="TrungBinh">Trung bình</MenuItem>
                <MenuItem value="Kho">Khó</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={filters.trangThai}
                onChange={(e) => setFilters({...filters, trangThai: e.target.value})}
                label="Trạng thái"
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="dachon">Đã chọn</MenuItem>
                <MenuItem value="chuachon">Chưa chọn</MenuItem>
              </Select>
            </FormControl>

            <Button 
              variant="outlined" 
              color="secondary"
              onClick={() => setFilters({searchText: '', loaiCauHoi: 'all', doKho: 'all', trangThai: 'all'})}
            >
              Xóa bộ lọc
            </Button>
          </Stack>
        </Box>

        {loading && <Typography>Đang tải câu hỏi...</Typography>}

        {!loading && cauHoiList.length > 0 && (
  <Box 
    sx={{ 
      mb: 2, 
      p: 1.5, 
      backgroundColor: '#f5f5f5', 
      borderRadius: 1,
      display: 'inline-block'
    }}
  >
    <Typography variant="subtitle1">
      Đã chọn: <strong style={{ color: '#245D51', fontSize: '1.1rem' }}>
        {cauHoiDaCoTrongDe.size}/{tongSoCau}
      </strong> câu hỏi
    </Typography>
  </Box>
)}

        <Stack spacing={2}>
          {cauHoiList.map((cauHoi, index) => {
            const daCoTrongDe = cauHoiDaCoTrongDe.has(cauHoi.id);
            const soThuTu = (page - 1) * limit + index + 1;

            return (
              <Card
                key={cauHoi.id}
                sx={{
                  border: daCoTrongDe ? "1px solid #4caf50" : "1px solid #ddd",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    boxShadow: 3,
                    transform: "translateY(-2px)",
                  },
                }}
                onClick={() => handleViewDetail(cauHoi.id)}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ width: '100%' }}>
                    <Box sx={{ flex: 1}}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography sx={{ fontSize: 18, fontWeight: "bold", flexShrink: 0 }}>
                          Câu {soThuTu}:
                        </Typography>
                        <Typography 
                          sx={{ 
                            fontSize: 18, 
                            fontWeight: 500,
                            flex: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {cauHoi.tenHienThi}
                        </Typography>
                        {daCoTrongDe && (
                          <Chip label="Đã thêm" size="small" color="success" sx={{ height: 24 }} />
                        )}
                      </Stack>

                      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                        <Chip
                          label={
                            cauHoi.loaiCauHoi === "MotDung" ? "Một đáp án" : "Nhiều đáp án"
                          }
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={
                            cauHoi.doKho === "De" 
                              ? "Dễ" 
                              : cauHoi.doKho === "TrungBinh" 
                                ? "Trung bình" 
                                : "Khó"
                          }
                          size="small"
                          variant="outlined"
                          color={
                            cauHoi.doKho === "De" 
                              ? "success" 
                              : cauHoi.doKho === "TrungBinh" 
                                ? "warning" 
                                : "error"
                          }
                        />
                      </Stack>
                    </Box>
                    
                    <Button
                      variant={daCoTrongDe ? "outlined" : "contained"}
                      color={daCoTrongDe ? "error" : "primary"}
                      onClick={(e) => handleToggleCauHoi(cauHoi.id, daCoTrongDe, e)}
                      sx={{
                        minWidth: 120,
                        ml: 2,
                        backgroundColor: daCoTrongDe ? "transparent" : "#245D51",
                      }}
                    >
                      {daCoTrongDe ? "Bỏ chọn" : "Chọn thêm"}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>

        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button color="secondary" variant="outlined" onClick={handleBack}>
          Quay lại
        </Button>
        <Button variant="contained" sx={{ backgroundColor: "#245D51" }} onClick={handleComplete}>
          Hoàn thành
        </Button>
      </Box>

      {/* Dialog chi tiết câu hỏi */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="md" fullWidth>
        <Box sx={{ backgroundColor: "#245D51" }}>
          <DialogTitle sx={{ color: "white" }}>
            Chi tiết câu hỏi
            <Button
              onClick={() => setOpenDetail(false)}
              sx={{ position: "absolute", right: 8, top: 8, minWidth: "auto", color: "white" }}
            >
              <CloseIcon />
            </Button>
          </DialogTitle>
        </Box>

        <DialogContent dividers>
          {loadingDetail && <Typography>Đang tải...</Typography>}

          {!loadingDetail && selectedCauHoi && (
            <Stack spacing={2}>
              <Typography variant="h6">{selectedCauHoi.cauHoi.tenHienThi}</Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Thông tin:
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Typography variant="body2">
                  <strong>Loại:</strong>{" "}
                  {selectedCauHoi.cauHoi.loaiCauHoi === "MotDung" ? "Một đáp án" : "Nhiều đáp án"}
                </Typography>
                <Typography variant="body2">
                  <strong>Độ khó:</strong>{" "}
  {selectedCauHoi.cauHoi.doKho === "De" 
    ? "Dễ" 
    : selectedCauHoi.cauHoi.doKho === "TrungBinh" 
      ? "Trung bình" 
      : "Khó"}
</Typography>
        <Typography variant="body2">
          <strong>Chương:</strong> {selectedCauHoi.tenchuong || selectedCauHoi.cauHoi.idChuong}
        </Typography>
      </Stack>

      {/* Nội dung câu hỏi */}
      <Box>
            <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>
              Nội dung câu hỏi:
            </Typography>
            <Box
              sx={{
                border: "1px solid #e0e0e0",
                borderRadius: 1,
                padding: 2,
                backgroundColor: "#fafafa",
                "& p": { margin: 0 },
                "& strong": { fontWeight: "bold" },
                "& em": { fontStyle: "italic" },
                "& u": { textDecoration: "underline" },
                whiteSpace: "pre-wrap",
              }}
            >
              {selectedCauHoi.cauHoi.noiDungCauHoiHTML ? (
                <div dangerouslySetInnerHTML={{ 
                  __html: selectedCauHoi.cauHoi.noiDungCauHoiHTML 
                }} />
              ) : (
                <Typography>{selectedCauHoi.cauHoi.noiDungCauHoi}</Typography>
              )}
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Các đáp án:
            </Typography>
            <Stack spacing={1}>
              {selectedCauHoi.dapAn.map((ans, index) => {
                const content = ans.noiDungHTML || ans.noiDung;
                
                return (
                  <Box
                    key={ans.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      padding: 1.5,
                      borderRadius: 1,
                      border: "1px solid #ddd",
                      backgroundColor: ans.dapAnDung ? "#e6f4ea" : "#fff",
                      "& strong": { fontWeight: "bold" },
                      "& em": { fontStyle: "italic" },
                      "& u": { textDecoration: "underline" },
                      "& p": { margin: 0 },
                    }}
                  >
                    <Typography sx={{ 
                      minWidth: 24, 
                      fontWeight: ans.dapAnDung ? "bold" : "normal",
                      color: ans.dapAnDung ? "#2e7d32" : "inherit"
                    }}>
                      {ans.dapAnDung ? "✓" : String.fromCharCode(65 + index)}.
                    </Typography>
                    
                    {ans.noiDungHTML ? (
                      <div dangerouslySetInnerHTML={{ __html: content }} />
                    ) : (
                      <Typography>{content}</Typography>
                    )}
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </Stack>
      )}
    </DialogContent>

    <DialogActions>
      <Button onClick={() => setOpenDetail(false)} variant="contained" sx={{ backgroundColor: "#245D51" }}>
        Đóng
      </Button>
    </DialogActions>
  </Dialog>

  {/* Dialog confirm khi quay lại */}
  <Dialog open={openConfirmBack} onClose={() => setOpenConfirmBack(false)}>
    <DialogTitle>Xác nhận</DialogTitle>
    <DialogContent>
      <Typography>Bạn có thay đổi chưa lưu. Bỏ thay đổi và quay lại?</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setOpenConfirmBack(false)}>Hủy</Button>
      <Button onClick={confirmBack} color="error" variant="contained">Đồng ý</Button>
    </DialogActions>
  </Dialog>

  {/* Dialog thông báo kết quả */}
  <Dialog open={openMessage} onClose={() => setOpenMessage(false)}>
    <DialogTitle>Thông báo</DialogTitle>
    <DialogContent>
      <Typography>{message}</Typography>
    </DialogContent>
    <DialogActions>
      <Button color="secondary" variant="outlined" onClick={() => setOpenMessage(false)} autoFocus>
        Xác nhận
      </Button>
    </DialogActions>
  </Dialog>
</Container>
  );
}

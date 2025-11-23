import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { 
  Box, Typography, Button, Paper, CircularProgress, Divider, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  LinearProgress
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import dayjs from "dayjs";
import { BaiLamSinhVienApi } from "../../services/bai-lam-sinh-vien.api";

interface BaiKiemTra {
  id: number;
  tenBaiKiemTra: string;
  loaiKiemTra: string;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  thoiGianLam: number;
  soLanLam: number;
  idLopHocPhan?: number;
  xemBaiLam?: boolean;
  hienThiKetQua?: boolean;
}

type TrangThai = "chuaBatDau" | "dangDienRa" | "daKetThuc" | "";

interface CauHoiThongKe {
  idCauHoi: number;
  tenHienThi: string;
  noiDung: string;
  soLanSai: number;
  soLanLam: number;
  tiLeSai: number;
}

interface DapAn {
  id: number;
  isCorrect: boolean;
  selected: boolean;
  [key: string]: any; 
}

const CollegeTestDetail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { idBaiKiemTra } = useParams();
  const baiKiemTra = location.state as BaiKiemTra;

  const [trangThai, setTrangThai] = useState<TrangThai>("");
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [loadingView, setLoadingView] = useState<number | null>(null);

  const [openThongKe, setOpenThongKe] = useState(false);
  const [loadingThongKe, setLoadingThongKe] = useState(false);
  const [thongKeData, setThongKeData] = useState<CauHoiThongKe[]>([]);

  // const [, forceTick] = useState(0);
  
  // useEffect(() => {
  //   const id = setInterval(() => forceTick(v => v + 1), 1000);
  //   return () => clearInterval(id);
  // }, []);

  useEffect(() => {
    if (!baiKiemTra) return;
    const now = dayjs();
    const batDau = dayjs(baiKiemTra.thoiGianBatDau);
    const ketThuc = dayjs(baiKiemTra.thoiGianKetThuc);

    if (now.isBefore(batDau)) setTrangThai("chuaBatDau");
    else if (now.isAfter(ketThuc)) setTrangThai("daKetThuc");
    else setTrangThai("dangDienRa");
  }, [baiKiemTra]);

  const fetchAttempts = async () => {
    if (!baiKiemTra?.id) return;
    try {
      setLoadingAttempts(true);
      const list = await BaiLamSinhVienApi.layBaiLamSinhVien(baiKiemTra.id);
      setAttempts(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("layBaiLamSinhVien error:", e);
      setAttempts([]);
    } finally {
      setLoadingAttempts(false);
    }
  };

  useEffect(() => {
    void fetchAttempts();
  }, [baiKiemTra?.id]);

  const attemptsSorted = useMemo(
    () =>
      [...attempts].sort(
        (a, b) =>
          new Date(b.update_at ?? b.thoiGianketThuc ?? b.thoiGianBatDau ?? 0).getTime() -
          new Date(a.update_at ?? a.thoiGianketThuc ?? a.thoiGianBatDau ?? 0).getTime()
      ),
    [attempts]
  );

  const isLuyenTap = baiKiemTra?.loaiKiemTra === "LuyenTap";
  
  const hasOngoingAttempt = useMemo(() => {
    return attempts.some(att => !att.thoiGianketThuc);
  }, [attempts]);
  
  const reachedAttemptLimit = useMemo(() => {
    if (isLuyenTap) {
      return false;
    } else {
      const completedAttempts = attempts.filter(att => att.thoiGianketThuc);
      return completedAttempts.length >= 1;
    }
  }, [attempts, isLuyenTap]);

  const autoSubmittedIdsRef = useRef<Set<number>>(new Set());
  
useEffect(() => {
  if (!baiKiemTra) return;

  const checkAndSubmit = async () => {
    const needSubmit: number[] = [];

    for (const att of attempts) {
      if (att.thoiGianketThuc) continue; // đã nộp rồi thì bỏ

      const used = att.thoiGianSuDung ?? 0;
      const overDuration = used >= baiKiemTra.thoiGianLam; // hết thời gian cho phép làm

      // Nếu bạn vẫn muốn giới hạn theo cửa sổ bài kiểm tra (thoiGianKetThuc), giữ thêm phần này:
      const overWindow = baiKiemTra.thoiGianKetThuc
        ? Date.now() >= new Date(baiKiemTra.thoiGianKetThuc).getTime()
        : false;

      if ((overDuration || overWindow) && !autoSubmittedIdsRef.current.has(att.id)) {
        needSubmit.push(att.id);
      }
    }

    if (needSubmit.length === 0) return;

    for (const id of needSubmit) {
      try {
        autoSubmittedIdsRef.current.add(id);
        await BaiLamSinhVienApi.nopBai(id);
      } catch (e) {
        console.error("Auto submit failed for", id, e);
      }
    }

    await fetchAttempts();
  };

  const id = setInterval(checkAndSubmit, 1000);
  return () => clearInterval(id);
}, [attempts, baiKiemTra]);


  // Format thời gian từ giây
  const formatTimeFromSeconds = (seconds?: number) => {
    if (!seconds) return '00:00:00';
    
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

const getRemainByUsage = (att: any) => {
  if(att.loaiKiemTra === "LuyenTap") {
    console.log('remainSec', att.thoiGianSuDung)
    return att.thoiGianSuDung
  }
  const used = att.thoiGianSuDung ?? 0;           // số giây đã làm
  const total = baiKiemTra.thoiGianLam || 0;      // tổng thời gian cho phép (giây)
  return Math.max(0, total - used);
};

const formatRemain = (att: any) => {
  const remainSec = getRemainByUsage(att);
  return formatTimeFromSeconds(remainSec);
};

  const handleLamBai = async () => {
    if (reachedAttemptLimit || hasOngoingAttempt) return;

    try {
      const baiLamMoi = await BaiLamSinhVienApi.taoBaiLam(baiKiemTra.id);
      navigate(`/quizzcenter/lam-bai/${baiKiemTra.id}`, {
        state: { baiKiemTra, baiLamMoi },
      });
    } catch (e: any) {
      console.error("Tạo bài làm thất bại:", e);
      alert(e?.response?.data?.message || "Có lỗi xảy ra khi tạo bài làm!");
    }
  };

  const handleQuayLaiLam = async (attId: number) => {
    try {
      const tiepTuc = await BaiLamSinhVienApi.tiepTucLamBai(attId);
  
      // Lấy thời gian còn lại đang hiển thị
      const att = attempts.find(a => a.id === attId);
      
      if (baiKiemTra.loaiKiemTra === "BaiKiemTra") {
        // Bài kiểm tra → lưu thời gian CÒN LẠI
        const usedSeconds = att?.thoiGianSuDung ?? 0;
        const totalSeconds = baiKiemTra.thoiGianLam || 0;
        const remainSeconds = Math.max(0, totalSeconds - usedSeconds);
        
        // LƯU REMAIN vào localStorage
        localStorage.setItem(`baiLam_${attId}_remain`, String(remainSeconds));
        
        console.log('🔵 Tiếp tục bài kiểm tra:', {
          used: usedSeconds,
          total: totalSeconds,
          remain: remainSeconds
        });
      } else {
        // Luyện tập → lưu thời gian ĐÃ DÙNG
        const usedSeconds = att?.thoiGianSuDung ?? 0;
        localStorage.setItem(`baiLam_${attId}_elapsed`, String(usedSeconds));
        
        console.log('🟢 Tiếp tục luyện tập:', {
          elapsed: usedSeconds
        });
      }
  
      navigate(`/quizzcenter/lam-bai/${baiKiemTra.id}`, {
        state: { baiKiemTra, baiLamMoi: tiepTuc },
      });
    } catch (e: any) {
      console.error("Tiếp tục làm bài thất bại:", e);
      if (e.response?.status === 404) {
        alert("Bài làm này không tồn tại hoặc đã được nộp. Không thể tiếp tục.");
      } else {
        alert(e?.response?.data?.message || "Có lỗi xảy ra khi tiếp tục làm bài!");
      }
    }
  };
  const handleXemBaiLam = async (idBaiLam: number) => {
    try {
      setLoadingView(idBaiLam);
      const xemLaiData = await BaiLamSinhVienApi.xemLaiBaiLam(idBaiLam);
      navigate(`/quizzcenter/xem-lai/${idBaiLam}`, { state: { xemLaiData } });
    } catch (e) {
      console.error("xemLaiBaiLam error:", e);
      navigate(`/quizzcenter/xem-lai/${idBaiLam}`);
    } finally {
      setLoadingView(null);
    }
  };

  const handleThongKe = async () => {
    setOpenThongKe(true);
    setLoadingThongKe(true);
    
    try {
      const completedAttempts = attempts.filter(att => att.thoiGianketThuc);
      
      if (completedAttempts.length === 0) {
        setThongKeData([]);
        setLoadingThongKe(false);
        return;
      }

      const statsMap = new Map<number, {
        idCauHoi: number;
        tenHienThi: string;
        noiDung: string;
        soLanSai: number;
        soLanLam: number;
      }>();

      for (const att of completedAttempts) {
        try {
          const xemLaiData = await BaiLamSinhVienApi.xemLaiBaiLam(att.id);
          
          for (const chiTiet of xemLaiData.chiTiet) {
            const idCauHoi = chiTiet.cauHoi?.id;
            if (!idCauHoi) continue;

            if (!statsMap.has(idCauHoi)) {
              statsMap.set(idCauHoi, {
                idCauHoi,
                tenHienThi: chiTiet.cauHoi?.tenHienThi || "",
                noiDung: chiTiet.cauHoi?.noiDung || "",
                soLanSai: 0,
                soLanLam: 0
              });
            }

            const stat = statsMap.get(idCauHoi)!;
            stat.soLanLam++;
            const danhSachDapAn = chiTiet.dapAn as DapAn[];

            const dapAnDung = danhSachDapAn.filter((da: DapAn) => da.isCorrect);
            const dapAnDaChon = danhSachDapAn.filter((da: DapAn) => da.selected);
            
            const soDungDaChon = dapAnDaChon.filter((da: DapAn) => da.isCorrect).length;
            const soSaiDaChon = dapAnDaChon.filter((da: DapAn) => !da.isCorrect).length;
            
            if (soSaiDaChon > 0 || soDungDaChon < dapAnDung.length) {
              stat.soLanSai++;
            }
          }
        } catch (e) {
          console.error("Lỗi khi lấy dữ liệu bài làm", att.id, e);
        }
      }

      const result: CauHoiThongKe[] = Array.from(statsMap.values())
        .map(stat => ({
          ...stat,
          tiLeSai: stat.soLanLam > 0 ? (stat.soLanSai / stat.soLanLam) * 100 : 0
        }))
        .filter(stat => stat.soLanSai > 0)
        .sort((a, b) => b.soLanSai - a.soLanSai);

      setThongKeData(result);
    } catch (e) {
      console.error("Lỗi khi thống kê:", e);
      alert("Có lỗi xảy ra khi thống kê!");
    } finally {
      setLoadingThongKe(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (!baiKiemTra) {
    return <Typography>Không tìm thấy thông tin bài kiểm tra.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{display:'flex', flexDirection:'row'}}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ fontWeight: 600, height:"40px" }}
            variant="text"
            color="primary"
          />
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#e91e63" }}>
            {baiKiemTra.tenBaiKiemTra}
          </Typography>
        </Box>
        <Box sx={{ mt: 1.5, display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip
            label={isLuyenTap ? "Luyện tập" : "Bài kiểm tra"}
            color={isLuyenTap ? "warning" : "primary"}
            size="small"
          />
        </Box>

        <Typography sx={{ mt: 2 }}>
          <strong>Bắt đầu:</strong> {dayjs(baiKiemTra.thoiGianBatDau).format("HH:mm DD/MM/YYYY")}
        </Typography>
        <Typography>
          <strong>Kết thúc:</strong> {dayjs(baiKiemTra.thoiGianKetThuc).format("HH:mm DD/MM/YYYY")}
        </Typography>
        {!isLuyenTap && (
          <Typography>
            <strong>Thời gian làm:</strong> {Math.floor(baiKiemTra.thoiGianLam / 60)} phút
          </Typography>
        )}
        
        {isLuyenTap && (
          <Typography>
            <strong>Số lần làm:</strong> Không giới hạn
          </Typography>
        )}
      </Paper>

      {trangThai === "chuaBatDau" && (
        <Typography sx={{ color: "orange", fontWeight: 600, mb: 2 }}>
          ❌ Bài kiểm tra chưa đến thời gian bắt đầu
        </Typography>
      )}
      {trangThai === "daKetThuc" && (
        <Typography sx={{ color: "red", fontWeight: 600, mb: 2 }}>
          ⏰ Đã hết thời gian làm bài
        </Typography>
      )}

      {trangThai === "dangDienRa" && !reachedAttemptLimit && !hasOngoingAttempt && (
        <Button
          variant="contained"
          color="success"
          onClick={handleLamBai}
          size="large"
          sx={{ mb: 2, py: 1.2, px: 4, fontWeight: 600 }}
        >
          Làm bài ngay
        </Button>
      )}
      {trangThai === "dangDienRa" && hasOngoingAttempt && (
        <Typography sx={{ color: "warning.main", fontWeight: 600, mb: 2 }}>
          ⚠️ Bạn đang có bài làm chưa hoàn thành. Vui lòng tiếp tục hoặc nộp bài trước khi làm lại.
        </Typography>
      )}
      {trangThai === "dangDienRa" && reachedAttemptLimit && !isLuyenTap && !hasOngoingAttempt && (
        <Typography sx={{ color: "text.secondary", fontWeight: 600, mb: 2 }}>
          Bạn đã hết lượt làm bài kiểm tra này.
        </Typography>
      )}

      {isLuyenTap && attempts.filter(att => att.thoiGianketThuc).length > 0 && (
        <Button
          variant="outlined"
          color="primary"
          onClick={handleThongKe}
          sx={{ mb: 2, ml: 2, fontWeight: 600 }}
        >
          📊 Xem thống kê
        </Button>
      )}

      <Paper sx={{ p: 0, overflow: "hidden" }}>
        <Box
          sx={{
            px: 2,
            py: 1.5,
            fontWeight: 700,
            display: "grid",
            gridTemplateColumns: "2fr 1.2fr 1.4fr 1.4fr",
            gap: 2,
            backgroundColor: "#f5f5f5",
          }}
        >
          <span>Ngày làm</span>
          <span>Kết quả</span>
          <span>Thời gian</span>
          <span></span>
        </Box>

        <Divider />

        {loadingAttempts ? (
          <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 1 }}>
            <CircularProgress size={20} /> Đang tải danh sách bài làm…
          </Box>
        ) : attemptsSorted.length === 0 ? (
          <Box sx={{ p: 3, color: "text.secondary" }}>Chưa có bài làm nào.</Box>
        ) : (
          attemptsSorted.map((att) => {
            const ngay = dayjs(att.thoiGianBatDau).format("HH:mm DD/MM/YYYY");

            const diemText =
              typeof att.tongDiem === "number"
                ? `${Number(att.tongDiem).toFixed(1)}/10`
                : "—";

            const isDangLam = !att.thoiGianketThuc;
            
            let thoiGianDisplay = "";
            if (isDangLam) {
              // còn bao nhiêu giây theo thoiGianSuDung
                thoiGianDisplay = formatRemain(att);
              console.log('bbb')
            } else {
              // tổng thời gian đã dùng
              thoiGianDisplay = formatTimeFromSeconds(att.thoiGianSuDung);
              console.log('aaaa')
            }


            return (
              <Box
                key={att.id}
                sx={{
                  px: 2,
                  py: 1.5,
                  display: "grid",
                  gridTemplateColumns: "2fr 1.2fr 1.4fr 1.4fr",
                  gap: 2,
                  alignItems: "center",
                  "&:not(:last-of-type)": { borderBottom: "1px solid #eee" },
                  backgroundColor: isDangLam ? "#fff3e0" : "transparent",
                }}
              >
                <Typography sx={{ fontWeight: 600 }}>
                  {ngay}
                  {isDangLam && (
                    <Chip 
                      label="Đang làm" 
                      color="warning" 
                      size="small" 
                      sx={{ ml: 1, fontSize: "0.7rem" }} 
                    />
                  )}
                </Typography>

                <Typography sx={{ fontWeight: 600 }}>
                  {isDangLam ? '0.0/10' : diemText}
                </Typography>

                <Typography sx={{ 
                  color: isDangLam ? "error.main" : "success.main",
                  fontWeight: 500 
                }}>
                  {isDangLam && !isLuyenTap ? (
                    <> Thời gian còn {thoiGianDisplay}</>
                  ) : (
                    <> Thời gian làm {formatTimeFromSeconds(att.thoiGianSuDung)}</>
                  )}
                </Typography>

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                  {isDangLam ? (
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={() => handleQuayLaiLam(att.id)}
                      sx={{ fontWeight: 600 }}
                    >
                      Tiếp tục làm bài
                    </Button>
                  ) : (
                    baiKiemTra.loaiKiemTra !== "BaiKiemTra" && (
                      <Button
                        variant="outlined"
                        onClick={() => handleXemBaiLam(att.id)}
                        disabled={loadingView === att.id}
                        sx={{ fontWeight: 600 }}
                      >
                        {loadingView === att.id ? "Đang mở…" : "Xem chi tiết"}
                      </Button>
                    )
                  )}
                </Box>
              </Box>
            );
          })
        )}
      </Paper>

      <Dialog 
        open={openThongKe} 
        onClose={() => setOpenThongKe(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#e91e63" }}>
          📊 Thống kê câu hỏi làm sai
        </DialogTitle>
        <DialogContent>
          {loadingThongKe ? (
            <Box sx={{ py: 3, textAlign: "center" }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>Đang phân tích dữ liệu...</Typography>
            </Box>
          ) : thongKeData.length === 0 ? (
            <Alert severity="info">
              Không có câu hỏi nào làm sai hoặc chưa có bài làm nào được hoàn thành.
            </Alert>
          ) : (
            <>
              <Typography sx={{ mb: 2, color: "text.secondary" }}>
                Hiển thị {thongKeData.length} câu hỏi có lỗi sai
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <TableCell sx={{ fontWeight: 700 }}>STT</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Câu hỏi</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Số lần sai</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Số lần làm</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Tỉ lệ sai</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {thongKeData.map((item, idx) => (
                      <TableRow key={item.idCauHoi}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                            {item.tenHienThi}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ color: "text.secondary" }}
                            dangerouslySetInnerHTML={{ __html: item.noiDung }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip 
                            label={item.soLanSai} 
                            color="error" 
                            size="small"
                            sx={{ fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell align="center">{item.soLanLam}</TableCell>
                        <TableCell align="center">
                          <Box>
                            <Typography 
                              variant="body2" 
                              sx={{ fontWeight: 700, color: "error.main", mb: 0.5 }}
                            >
                              {item.tiLeSai.toFixed(1)}%
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={item.tiLeSai} 
                              color="error"
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenThongKe(false)} variant="contained">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CollegeTestDetail;
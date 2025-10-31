import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box, Typography, Button, Paper, Radio, Checkbox, RadioGroup,
  FormControlLabel, FormGroup, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, Alert, Chip
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { BaiLamSinhVienApi, BaiLamResponse } from "../../services/bai-lam-sinh-vien.api";

type DapAnDaChon = Record<number, number[]>;

interface BaiKiemTraInfo {
  id: number;
  tenBaiKiemTra: string;
  loaiKiemTra: string;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  thoiGianLam: number; // seconds
  xemBaiLam?: boolean;
  hienThiKetQua?: boolean;
}

const DoTestPage: React.FC = () => {
  const { idBaiKiemTra } = useParams<{ idBaiKiemTra: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as { baiKiemTra?: BaiKiemTraInfo; baiLamMoi?: BaiLamResponse } | undefined;
  const baiKiemTraInfo = state?.baiKiemTra;
  const baiLamResponseInit = state?.baiLamMoi;

  const [loading, setLoading] = useState(true);
  const [baiLamData, setBaiLamData] = useState<BaiLamResponse | null>(null);
  const [dapAnDaChon, setDapAnDaChon] = useState<DapAnDaChon>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showNopBaiDialog, setShowNopBaiDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savingQuestionId, setSavingQuestionId] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const autosubmitted = useRef(false);
  const deadlineRef = useRef<number>(0);
  const baiLamDataRef = useRef<BaiLamResponse | null>(null);
  useEffect(() => { baiLamDataRef.current = baiLamData; }, [baiLamData]);

  const isLuyenTap = baiKiemTraInfo?.loaiKiemTra === "LuyenTap";

  const DETAIL_PATH = `/quizzcenter/bai-kiem-tra-chi-tiet/${idBaiKiemTra}`;

  // ------------------- INIT BÀI LÀM -------------------
  useEffect(() => {
    const init = async () => {
      if (!idBaiKiemTra) return;
      try {
        setLoading(true);
        let response: BaiLamResponse;

        if (baiLamResponseInit) {
          response = baiLamResponseInit;
        } else {
          const all = await BaiLamSinhVienApi.layBaiLamSinhVien(Number(idBaiKiemTra));
          const dangLam = (Array.isArray(all) ? all : []).find((x: any) => x.trangThaiBaiLam === "DangLam");
          if (dangLam) {
            response = await BaiLamSinhVienApi.tiepTucLamBai(dangLam.id);
          } else {
            response = await BaiLamSinhVienApi.taoBaiLam(Number(idBaiKiemTra));
          }
        }

        setBaiLamData(response);

        const saved: DapAnDaChon = {};
        response.cauHoi.forEach((item) => {
          if (item.luaChon?.mangIdDapAn?.length) {
            saved[item.idCauHoiBaiKiemTra] = item.luaChon.mangIdDapAn;
          }
        });
        setDapAnDaChon(saved);

        // deadline cho bài kiểm tra
        if (!isLuyenTap) {
          const startMs = new Date(response.baiLam.thoiGianBatDau).getTime();
          const byDuration = startMs + ((baiKiemTraInfo?.thoiGianLam ?? 3600) * 1000);
          const byWindow = baiKiemTraInfo?.thoiGianKetThuc
            ? new Date(baiKiemTraInfo.thoiGianKetThuc).getTime()
            : Number.POSITIVE_INFINITY;
          deadlineRef.current = Math.min(byDuration, byWindow);
        }
      } catch (e: any) {
        console.error("init error:", e);
        alert(e?.response?.data?.message || "Có lỗi xảy ra khi tải bài kiểm tra!");
        navigate(DETAIL_PATH, { state: baiKiemTraInfo });
      } finally {
        setLoading(false);
      }
    };

    void init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idBaiKiemTra]);

  // ------------------- AUTO SUBMIT -------------------
  const handleAutoSubmit = useCallback(async () => {
    if (autosubmitted.current) return;
    const data = baiLamDataRef.current;
    if (!data) return;

    autosubmitted.current = true;
    setIsLocked(true);

    try {
      console.log("⏰ Hết giờ! Auto submit...");
      await BaiLamSinhVienApi.nopBai(data.baiLam.id);
      console.log("✅ Auto submit thành công");
      navigate(DETAIL_PATH, { state: baiKiemTraInfo });
    } catch (e) {
      console.error("❌ Auto submit failed:", e);
      navigate(DETAIL_PATH, { state: baiKiemTraInfo });
    }
  }, [navigate, DETAIL_PATH, baiKiemTraInfo]);

  // ------------------- TIMER -------------------
  useEffect(() => {
    if (!baiLamData || isLuyenTap) return;

    const tick = () => {
      const remain = Math.max(0, Math.floor((deadlineRef.current - Date.now()) / 1000));
      setTimeLeft(remain);
      if (remain <= 0) handleAutoSubmit();
    };

    tick(); // render ngay
    const id = setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);

    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [baiLamData, isLuyenTap, handleAutoSubmit]);

  // ------------------- FORMAT TIME -------------------
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
  };

  // ------------------- SAVE 1 CÂU -------------------
  const saveOneQuestion = async (idCauHoiBaiKiemTra: number, mangIdDapAn: number[]) => {
    if (!baiLamData) return;
    try {
      setSavingQuestionId(idCauHoiBaiKiemTra);
      await BaiLamSinhVienApi.luuTamDapAn(baiLamData.baiLam.id, [{ idCauHoiBaiKiemTra, mangIdDapAn }]);
    } catch (e) {
      console.error("Lưu đáp án thất bại:", e);
    } finally {
      setSavingQuestionId((curr) => (curr === idCauHoiBaiKiemTra ? null : curr));
    }
  };

  const handleChonDapAn = (idCauHoiBaiKiemTra: number, idDapAn: number, loaiCauHoi: string) => {
    if (isLocked) return;
    setDapAnDaChon((prev) => {
      let newArr: number[];
      if (loaiCauHoi === "MotDung") {
        newArr = [idDapAn];
      } else {
        const current = prev[idCauHoiBaiKiemTra] || [];
        newArr = current.includes(idDapAn) ? current.filter((x) => x !== idDapAn) : [...current, idDapAn];
      }
      void saveOneQuestion(idCauHoiBaiKiemTra, newArr);
      return { ...prev, [idCauHoiBaiKiemTra]: newArr };
    });
  };

  // ------------------- NỘP BÀI -------------------
  const handleNopBai = async () => {
    if (!baiLamData) return;
    try {
      setIsSubmitting(true);
      const result = await BaiLamSinhVienApi.nopBai(baiLamData.baiLam.id);
      alert(`Nộp bài thành công! Điểm: ${result.tongDiem}/10`);
      navigate(DETAIL_PATH, { state: baiKiemTraInfo });
    } catch (e: any) {
      console.error("Error submitting:", e);
      alert(e?.response?.data?.message || "Có lỗi xảy ra khi nộp bài!");
    } finally {
      setIsSubmitting(false);
      setShowNopBaiDialog(false);
    }
  };

  // ------------------- UTILS -------------------
  const isCauHoiDaTraLoi = (idCauHoiBaiKiemTra: number) =>
    (dapAnDaChon[idCauHoiBaiKiemTra]?.length ?? 0) > 0;

  const soCauDaLam = useMemo(
    () => Object.values(dapAnDaChon).filter((arr) => arr.length > 0).length,
    [dapAnDaChon]
  );

  // ------------------- RENDER -------------------
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!baiLamData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Không tìm thấy bài làm!</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5", py: 3 }}>
      <Box sx={{ maxWidth: 1400, mx: "auto", px: 2, display: "flex", gap: 3, flexWrap: "wrap" }}>
        {/* Trái: câu hỏi */}
        <Box sx={{ flex: "1 1 65%", minWidth: 300 }}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#e91e63", mb: 1 }}>
              {baiKiemTraInfo?.tenBaiKiemTra || "Bài kiểm tra"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tổng số câu: {baiLamData.cauHoi.length} | Đã làm: {soCauDaLam}/{baiLamData.cauHoi.length}
            </Typography>
          </Paper>

          {baiLamData.cauHoi.map((item, index) => (
            <Paper key={item.idCauHoiBaiKiemTra} sx={{ p: 3, mb: 2 }} id={`cau-${index}`}>
              <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2, gap: 1 }}>
                <Chip label={`Câu ${index + 1}`} color="primary" size="small" sx={{ fontWeight: 600 }} />
                {isCauHoiDaTraLoi(item.idCauHoiBaiKiemTra) && (
                  <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 20 }} />
                )}
                {savingQuestionId === item.idCauHoiBaiKiemTra && (
                  <Typography variant="caption" sx={{ color: "text.secondary" }}>
                    Đang lưu...
                  </Typography>
                )}
              </Box>

              <Typography
                variant="body1"
                sx={{ fontWeight: 500, mb: 2 }}
                dangerouslySetInnerHTML={{ __html: item.cauHoi.noiDung || "" }}
              />

              {item.cauHoi.loai === "MotDung" ? (
                <RadioGroup
                  value={dapAnDaChon[item.idCauHoiBaiKiemTra]?.[0] || ""}
                  onChange={(e) =>
                    handleChonDapAn(item.idCauHoiBaiKiemTra, Number(e.target.value), "MotDung")
                  }
                >
                  {item.dapAn.map((dapAn) => (
                    <FormControlLabel
                      key={dapAn.id}
                      value={dapAn.id}
                      control={<Radio disabled={isLocked} />}
                      label={<span dangerouslySetInnerHTML={{ __html: dapAn.noiDung }} />}
                      sx={{
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                        px: 2,
                        py: 0.5,
                        mb: 1,
                        "&:hover": { backgroundColor: isLocked ? "transparent" : "#f5f5f5" },
                        opacity: isLocked ? 0.6 : 1,
                      }}
                    />
                  ))}
                </RadioGroup>
              ) : (
                <FormGroup>
                  {item.dapAn.map((dapAn) => (
                    <FormControlLabel
                      key={dapAn.id}
                      control={
                        <Checkbox
                          checked={dapAnDaChon[item.idCauHoiBaiKiemTra]?.includes(dapAn.id) || false}
                          onChange={() =>
                            handleChonDapAn(item.idCauHoiBaiKiemTra, dapAn.id, "NhieuDung")
                          }
                          disabled={isLocked}
                        />
                      }
                      label={<span dangerouslySetInnerHTML={{ __html: dapAn.noiDung }} />}
                      sx={{
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                        px: 2,
                        py: 0.5,
                        mb: 1,
                        "&:hover": { backgroundColor: isLocked ? "transparent" : "#f5f5f5" },
                        opacity: isLocked ? 0.6 : 1,
                      }}
                    />
                  ))}
                </FormGroup>
              )}
            </Paper>
          ))}
        </Box>

        {/* Phải: timer + danh sách câu + hành động */}
        <Box sx={{ flex: "1 1 30%", minWidth: 250, position: "sticky", top: 20, height: "fit-content" }}>
          <Paper sx={{ p: 3 }}>
            {!isLuyenTap && (
              <Box sx={{ textAlign: "center", mb: 3, p: 2, backgroundColor: timeLeft < 300 ? "#ffebee" : "#e3f2fd", borderRadius: 2 }}>
                <AccessTimeIcon sx={{ fontSize: 40, color: timeLeft < 300 ? "#f44336" : "#2196f3", mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, color: timeLeft < 300 ? "#f44336" : "#2196f3" }}>
                  {formatTime(timeLeft)}
                </Typography>
                <Typography variant="body2" color="text.secondary">Thời gian còn lại</Typography>
              </Box>
            )}

            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>Danh sách câu hỏi</Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {baiLamData.cauHoi.map((item, index) => (
                <Button
                  key={item.idCauHoiBaiKiemTra}
                  variant={isCauHoiDaTraLoi(item.idCauHoiBaiKiemTra) ? "contained" : "outlined"}
                  color={isCauHoiDaTraLoi(item.idCauHoiBaiKiemTra) ? "success" : "inherit"}
                  sx={{ minWidth: 50, minHeight: 50, fontWeight: 600 }}
                  onClick={() => document.getElementById(`cau-${index}`)?.scrollIntoView({ behavior: "smooth" })}
                >
                  {index + 1}
                </Button>
              ))}
            </Box>

            <Button
              variant="contained"
              color="error"
              fullWidth
              size="large"
              sx={{ mt: 3, py: 1.5, fontWeight: 600, fontSize: "1.1rem" }}
              onClick={() => setShowNopBaiDialog(true)}
              disabled={isLocked}
            >
              NỘP BÀI
            </Button>
          </Paper>
        </Box>
      </Box>

      <Dialog open={showNopBaiDialog} onClose={() => setShowNopBaiDialog(false)}>
        <DialogTitle>Xác nhận nộp bài</DialogTitle>
        <DialogContent>
          <Typography>Bạn đã làm {soCauDaLam}/{baiLamData.cauHoi.length} câu.</Typography>
          <Typography sx={{ mt: 1 }}>Bạn có chắc chắn muốn nộp bài không?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNopBaiDialog(false)} disabled={isSubmitting}>Hủy</Button>
          <Button onClick={handleNopBai} variant="contained" color="error" disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : "Nộp bài"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    
  );
};

export default DoTestPage;

// src/pages/student/DoTestPage.tsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  Radio,
  Checkbox,
  RadioGroup,
  FormControlLabel,
  FormGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Pagination,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FlagIcon from "@mui/icons-material/Flag";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import {
  BaiLamSinhVienApi,
  BaiLamResponse,
} from "../../services/bai-lam-sinh-vien.api";
import { useTimeTracking } from "../../hooks/useTimeTracking";

type DapAnDaChon = Record<number, number[]>;

interface BaiKiemTraInfo {
  id: number;
  tenBaiKiemTra: string;
  loaiKiemTra: string;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  thoiGianLam: number; // giây
  xemBaiLam?: boolean;
  hienThiKetQua?: boolean;
}

const QUESTIONS_PER_PAGE = 8;

const DoTestPage: React.FC = () => {
  const { idBaiKiemTra, idBaiLam } = useParams<{
    idBaiKiemTra: string;
    idBaiLam?: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as
    | { baiKiemTra?: BaiKiemTraInfo; baiLamMoi?: BaiLamResponse }
    | undefined;
  const baiKiemTraInfo = state?.baiKiemTra;
  const baiLamResponseInit = state?.baiLamMoi;

  const [loading, setLoading] = useState(true);
  const [baiLamData, setBaiLamData] = useState<BaiLamResponse | null>(null);
  const [dapAnDaChon, setDapAnDaChon] = useState<DapAnDaChon>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(
    new Set()
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [showNopBaiDialog, setShowNopBaiDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savingQuestionId, setSavingQuestionId] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const autosubmitted = useRef(false);

  const isLuyenTap = baiKiemTraInfo?.loaiKiemTra === "LuyenTap";
  const DETAIL_PATH = `/quizzcenter/bai-kiem-tra-chi-tiet/${idBaiKiemTra}`;

  // lấy thoiGianSuDung từ backend (nếu có) - dùng để fallback nếu không có localStorage
  const initialUsedSeconds =
    (baiLamData as any)?.baiLam?.thoiGianSuDung ?? 0;

  // storageKey cho localStorage: LƯU THỜI GIAN CÒN LẠI (BaiKiemTra)
const storageKey = useMemo(() => {
  if (!baiLamData?.baiLam?.id) return undefined;

  if (isLuyenTap) {
    return `baiLam_${baiLamData.baiLam.id}_elapsed`; // luyện tập dùng elapsed
  }

  return `baiLam_${baiLamData.baiLam.id}_remain`; // bài kiểm tra dùng remain
}, [baiLamData, isLuyenTap]);


  // ------------------- PHÂN TRANG -------------------
  const totalPages = useMemo(() => {
    if (!baiLamData) return 0;
    return Math.ceil(baiLamData.cauHoi.length / QUESTIONS_PER_PAGE);
  }, [baiLamData]);

  const currentQuestions = useMemo(() => {
    if (!baiLamData) return [];
    const startIndex = (currentPage - 1) * QUESTIONS_PER_PAGE;
    const endIndex = startIndex + QUESTIONS_PER_PAGE;
    return baiLamData.cauHoi.slice(startIndex, endIndex);
  }, [baiLamData, currentPage]);

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ------------------- INIT BÀI LÀM -------------------
  useEffect(() => {
    const init = async () => {
      if (!idBaiKiemTra) return;
      try {
        setLoading(true);
        let response: BaiLamResponse;

        if (idBaiLam) {
          // 1) Có idBaiLam trên URL
          response = await BaiLamSinhVienApi.tiepTucLamBai(Number(idBaiLam));
        } else if (baiLamResponseInit) {
          // 2) Có state từ "Làm bài ngay"
          response = baiLamResponseInit;
          navigate(
            `/quizzcenter/lam-bai/${idBaiKiemTra}/${response.baiLam.id}`,
            {
              replace: true,
              state: { baiKiemTra: baiKiemTraInfo, baiLamMoi: response },
            }
          );
        } else {
          // 3) Tự tìm bài làm đang làm hoặc tạo mới
          const all = await BaiLamSinhVienApi.layBaiLamSinhVien(
            Number(idBaiKiemTra)
          );
          const dangLam = (Array.isArray(all) ? all : []).find(
            (x: any) => x.trangThaiBaiLam === "DangLam"
          );

          if (dangLam) {
            response = await BaiLamSinhVienApi.tiepTucLamBai(dangLam.id);
            navigate(
              `/quizzcenter/lam-bai/${idBaiKiemTra}/${dangLam.id}`,
              {
                replace: true,
                state: { baiKiemTra: baiKiemTraInfo },
              }
            );
          } else {
            response = await BaiLamSinhVienApi.taoBaiLam(
              Number(idBaiKiemTra)
            );
            navigate(
              `/quizzcenter/lam-bai/${idBaiKiemTra}/${response.baiLam.id}`,
              {
                replace: true,
                state: { baiKiemTra: baiKiemTraInfo, baiLamMoi: response },
              }
            );
          }
        }

        setBaiLamData(response);

        const saved: DapAnDaChon = {};
        response.cauHoi.forEach((item) => {
          if (item.luaChon?.mangIdDapAn?.length) {
            saved[item.idChiTietBaiLam] = item.luaChon.mangIdDapAn;
          }
        });
        setDapAnDaChon(saved);
      } catch (e: any) {
        console.error("Init error:", e);
        alert(
          e?.response?.data?.message ||
            "Có lỗi xảy ra khi tải bài kiểm tra!"
        );
        navigate(DETAIL_PATH, { state: baiKiemTraInfo });
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, [
    idBaiKiemTra,
    idBaiLam,
    navigate,
    DETAIL_PATH,
    baiKiemTraInfo,
    baiLamResponseInit,
  ]);

  // ------------------- AUTO SUBMIT -------------------
  const handleAutoSubmit = useCallback(async () => {
    if (autosubmitted.current || !baiLamData) return;

    autosubmitted.current = true;
    setIsLocked(true);

    try {
      console.log("⏰ Hết giờ! Auto submit…");
      await timeTracking.forceSave();
      await BaiLamSinhVienApi.nopBai(baiLamData.baiLam.id);

      // xóa localStorage cho bài làm này
      if (storageKey) {
        localStorage.removeItem(storageKey);
      }

      navigate(DETAIL_PATH, {
        state: baiKiemTraInfo,
        replace: true,
      });
    } catch (e) {
      console.error("Auto submit failed:", e);
      navigate(DETAIL_PATH, {
        state: baiKiemTraInfo,
        replace: true,
      });
    }
  }, [baiLamData, navigate, DETAIL_PATH, baiKiemTraInfo, storageKey]);

  // ------------------- TIME TRACKING -------------------
  const timeTracking = useTimeTracking({
    idBaiLamSinhVien: baiLamData?.baiLam.id || null,
    loaiKiemTra: baiKiemTraInfo?.loaiKiemTra || "BaiKiemTra",
    thoiGianLam: baiKiemTraInfo?.thoiGianLam,
    thoiGianKetThucCuaSo: baiKiemTraInfo?.thoiGianKetThuc,
    isActive: !isLocked && !!baiLamData,
    onTimeUp: handleAutoSubmit,
    initialUsedSeconds,
    storageKey,
  });

  // optional: vẫn giữ beforeunload để save lần cuối
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (baiLamData && !isLocked) {
        void timeTracking.forceSave();
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [baiLamData, isLocked, timeTracking]);

  // ------------------- SAVE 1 CÂU -------------------
  const saveOneQuestion = async (
    idChiTietBaiLam: number,
    mangIdDapAn: number[]
  ) => {
    if (!baiLamData) return;
    try {
      setSavingQuestionId(idChiTietBaiLam);
      await BaiLamSinhVienApi.luuTamDapAn(baiLamData.baiLam.id, [
        { idChiTietBaiLam, mangIdDapAn },
      ]);
    } catch (e) {
      console.error("Lưu đáp án thất bại:", e);
    } finally {
      setSavingQuestionId((curr) =>
        curr === idChiTietBaiLam ? null : curr
      );
    }
  };

  const handleChonDapAn = (
    idChiTietBaiLam: number,
    idDapAn: number,
    loaiCauHoi: string
  ) => {
    if (isLocked) return;
    setDapAnDaChon((prev) => {
      let newArr: number[];
      if (loaiCauHoi === "MotDung") {
        newArr = [idDapAn];
      } else {
        const current = prev[idChiTietBaiLam] || [];
        newArr = current.includes(idDapAn)
          ? current.filter((x) => x !== idDapAn)
          : [...current, idDapAn];
      }
      void saveOneQuestion(idChiTietBaiLam, newArr);
      return { ...prev, [idChiTietBaiLam]: newArr };
    });
  };

  // ------------------- CẮM CỜ -------------------
  const handleToggleFlag = (
    idChiTietBaiLam: number,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(idChiTietBaiLam)) newSet.delete(idChiTietBaiLam);
      else newSet.add(idChiTietBaiLam);
      return newSet;
    });
  };

  // ------------------- NỘP BÀI -------------------
  const handleNopBai = async () => {
    if (!baiLamData) return;
    try {
      setIsSubmitting(true);
      await timeTracking.forceSave();
      const result = await BaiLamSinhVienApi.nopBai(baiLamData.baiLam.id);

      // xóa localStorage cho bài làm này
      if (storageKey) {
        localStorage.removeItem(storageKey);
      }

      alert(`Nộp bài thành công! Điểm: ${result.tongDiem}/10`);
      navigate(DETAIL_PATH, {
        state: baiKiemTraInfo,
        replace: true,
      });
    } catch (e: any) {
      console.error("Error submitting:", e);
      alert(e?.response?.data?.message || "Có lỗi xảy ra khi nộp bài!");
    } finally {
      setIsSubmitting(false);
      setShowNopBaiDialog(false);
    }
  };

  // ------------------- UTILS -------------------
  const isCauHoiDaTraLoi = (idChiTietBaiLam: number) =>
    (dapAnDaChon[idChiTietBaiLam]?.length ?? 0) > 0;

  const soCauDaLam = useMemo(
    () =>
      Object.values(dapAnDaChon).filter((arr) => arr.length > 0).length,
    [dapAnDaChon]
  );

  const soCauDaCamCo = flaggedQuestions.size;

  const navigateToQuestion = (globalIndex: number) => {
    const page = Math.floor(globalIndex / QUESTIONS_PER_PAGE) + 1;
    setCurrentPage(page);
    setTimeout(() => {
      const localIndex = globalIndex % QUESTIONS_PER_PAGE;
      document
        .getElementById(`cau-${localIndex}`)
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // ------------------- RENDER -------------------
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
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
      <Box
        sx={{
          maxWidth: 1400,
          mx: "auto",
          px: 2,
          display: "flex",
          gap: 3,
          flexWrap: "wrap",
        }}
      >
        {/* Trái: câu hỏi */}
        <Box sx={{ flex: "1 1 65%", minWidth: 300 }}>
          <Paper sx={{ p: 3, mb: 2, boxShadow: "none" }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
              {baiKiemTraInfo?.tenBaiKiemTra || "Bài kiểm tra"}
            </Typography>

            <Typography variant="body2">
              Tổng số câu: {baiLamData.cauHoi.length} | Đã làm: {soCauDaLam}/
              {baiLamData.cauHoi.length} | Đã cắm cờ: {soCauDaCamCo}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              Trang {currentPage}/{totalPages}
            </Typography>
          </Paper>

          {currentQuestions.map((item, localIndex) => {
            const globalIndex =
              (currentPage - 1) * QUESTIONS_PER_PAGE + localIndex;
            return (
              <Paper
                key={item.idChiTietBaiLam}
                sx={{ p: 3, mb: 2, boxShadow: "none" }}
                id={`cau-${localIndex}`}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    mb: 2,
                    gap: 1,
                  }}
                >
                  <Chip
                    label={`Câu ${globalIndex + 1}`}
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                  {isCauHoiDaTraLoi(item.idChiTietBaiLam) && (
                    <CheckCircleIcon
                      sx={{ color: "#4caf50", fontSize: 20 }}
                    />
                  )}
                  {savingQuestionId === item.idChiTietBaiLam && (
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      Đang lưu...
                    </Typography>
                  )}

                  <Box sx={{ ml: "auto" }}>
                    <Tooltip
                      title={
                        flaggedQuestions.has(item.idChiTietBaiLam)
                          ? "Bỏ cắm cờ"
                          : "Cắm cờ"
                      }
                    >
                      <IconButton
                        size="small"
                        onClick={(e) =>
                          handleToggleFlag(item.idChiTietBaiLam, e)
                        }
                        sx={{
                          color: flaggedQuestions.has(item.idChiTietBaiLam)
                            ? "#ff9800"
                            : "text.secondary",
                        }}
                      >
                        {flaggedQuestions.has(item.idChiTietBaiLam) ? (
                          <FlagIcon />
                        ) : (
                          <FlagOutlinedIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                <Typography
                  variant="body1"
                  sx={{ fontWeight: 500, mb: 2 }}
                  dangerouslySetInnerHTML={{
                    __html: item.cauHoi.noiDung || "",
                  }}
                />

                {item.cauHoi.loai === "MotDung" ? (
                  <RadioGroup
                    value={dapAnDaChon[item.idChiTietBaiLam]?.[0] || ""}
                    onChange={(e) =>
                      handleChonDapAn(
                        item.idChiTietBaiLam,
                        Number(e.target.value),
                        "MotDung"
                      )
                    }
                  >
                    {item.dapAn.map((dapAn, idx) => (
                      <FormControlLabel
                        key={dapAn.id}
                        value={dapAn.id}
                        control={<Radio disabled={isLocked} />}
                        label={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontWeight: 600,
                                minWidth: "24px",
                              }}
                            >
                              {String.fromCharCode(65 + idx)}.
                            </Typography>
                            <span
                              dangerouslySetInnerHTML={{
                                __html: dapAn.noiDung,
                              }}
                            />
                          </Box>
                        }
                        sx={{
                          borderRadius: 1,
                          px: 2,
                          py: 0.5,
                          mb: 1,
                          alignItems: "center",
                          "&:hover": {
                            backgroundColor: isLocked
                              ? "transparent"
                              : "#f5f5f5",
                          },
                          opacity: isLocked ? 0.6 : 1,
                        }}
                      />
                    ))}
                  </RadioGroup>
                ) : (
                  <FormGroup>
                    {item.dapAn.map((dapAn, idx) => (
                      <FormControlLabel
                        key={dapAn.id}
                        control={
                          <Checkbox
                            checked={
                              dapAnDaChon[item.idChiTietBaiLam]?.includes(
                                dapAn.id
                              ) || false
                            }
                            onChange={() =>
                              handleChonDapAn(
                                item.idChiTietBaiLam,
                                dapAn.id,
                                "NhieuDung"
                              )
                            }
                            disabled={isLocked}
                          />
                        }
                        label={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography
                              component="span"
                              sx={{
                                fontWeight: 600,
                                minWidth: "24px",
                              }}
                            >
                              {String.fromCharCode(97 + idx)}.
                            </Typography>
                            <span
                              dangerouslySetInnerHTML={{
                                __html: dapAn.noiDung,
                              }}
                            />
                          </Box>
                        }
                        sx={{
                          borderRadius: 1,
                          px: 2,
                          py: 0.5,
                          mb: 1,
                          alignItems: "center",
                          "&:hover": {
                            backgroundColor: isLocked
                              ? "transparent"
                              : "#f5f5f5",
                          },
                          opacity: isLocked ? 0.6 : 1,
                        }}
                      />
                    ))}
                  </FormGroup>
                )}
              </Paper>
            );
          })}

          {totalPages > 1 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 3,
                mb: 2,
              }}
            >
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </Box>

        {/* Phải: timer + danh sách câu + hành động */}
        <Box
          sx={{
            flex: "1 1 30%",
            minWidth: 250,
            position: "sticky",
            top: 20,
            height: "fit-content",
          }}
        >
          <Paper sx={{ p: 3 }}>
            {!isLuyenTap ? (
              <Box
                sx={{
                  textAlign: "center",
                  mb: 3,
                  p: 2,
                  backgroundColor:
                    timeTracking.timeRemaining < 300 ? "#ffebee" : "#e3f2fd",
                  borderRadius: 2,
                }}
              >
                <AccessTimeIcon
                  sx={{
                    fontSize: 40,
                    color:
                      timeTracking.timeRemaining < 300
                        ? "#f44336"
                        : "#2196f3",
                    mb: 1,
                  }}
                />
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color:
                      timeTracking.timeRemaining < 300
                        ? "#f44336"
                        : "#2196f3",
                  }}
                >
                  {timeTracking.timeRemainingFormatted}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Thời gian còn lại
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  textAlign: "center",
                  mb: 3,
                  p: 2,
                  backgroundColor: "#e8f5e9",
                  borderRadius: 2,
                }}
              >
                <AccessTimeIcon
                  sx={{ fontSize: 40, color: "#4caf50", mb: 1 }}
                />
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: "#4caf50" }}
                >
                  {timeTracking.timeElapsedFormatted}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Thời gian đã làm
                </Typography>
              </Box>
            )}

            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, mb: 2 }}
            >
              Danh sách câu hỏi
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {baiLamData.cauHoi.map((item, index) => {
                const isFlagged = flaggedQuestions.has(item.idChiTietBaiLam);
                const isDone = isCauHoiDaTraLoi(item.idChiTietBaiLam);

                return (
                  <Box
                    key={item.idChiTietBaiLam}
                    sx={{ position: "relative" }}
                  >
                    <Button
                      variant={isDone ? "contained" : "outlined"}
                      color={isDone ? "success" : "inherit"}
                      sx={{
                        width: 50,
                        height: 50,
                        fontWeight: 600,
                        ...(isFlagged && {
                          border: "2px solid #ff9800",
                          backgroundColor: isDone ? undefined : "#fff3e0",
                        }),
                      }}
                      onClick={() => navigateToQuestion(index)}
                    >
                      {index + 1}
                    </Button>
                    {isFlagged && (
                      <FlagIcon
                        sx={{
                          position: "absolute",
                          top: -4,
                          right: -4,
                          fontSize: 16,
                          color: "#ff9800",
                        }}
                      />
                    )}
                  </Box>
                );
              })}
            </Box>

            <Button
              variant="contained"
              color="error"
              fullWidth
              size="large"
              sx={{
                backgroundColor: "#245D51",
                mt: 3,
                py: 1.5,
                fontWeight: 600,
                fontSize: "1.1rem",
              }}
              onClick={() => setShowNopBaiDialog(true)}
              disabled={isLocked}
            >
              NỘP BÀI
            </Button>
          </Paper>
        </Box>
      </Box>

      <Dialog
        open={showNopBaiDialog}
        onClose={() => setShowNopBaiDialog(false)}
      >
        <DialogTitle>Xác nhận nộp bài</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn đã làm {soCauDaLam}/{baiLamData.cauHoi.length} câu.
          </Typography>
          {soCauDaCamCo > 0 && (
            <Typography sx={{ mt: 1, color: "#ff9800" }}>
              ⚠️ Bạn còn {soCauDaCamCo} câu đã cắm cờ chưa xem lại.
            </Typography>
          )}
          <Typography sx={{ mt: 1 }}>
            Bạn có chắc chắn muốn nộp bài không?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowNopBaiDialog(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleNopBai}
            variant="contained"
            color="error"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : "Nộp bài"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoTestPage;

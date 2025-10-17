import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { BaiLamSinhVienApi, CauHoiBaiKiemTra, BaiLamSinhVien, UpdateDapAnDto } from "../../api/bai-lam-sinh-vien.api";
import { BaiKiemTraApi } from "../../api/bai-kiem-tra.api";

interface DapAnDaChon {
  [idCauHoi: number]: number[];
}

const LamBaiPage: React.FC = () => {
  const { idBaiKiemTra } = useParams<{ idBaiKiemTra: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [baiLam, setBaiLam] = useState<BaiLamSinhVien | null>(null);
  const [cauHoiList, setCauHoiList] = useState<CauHoiBaiKiemTra[]>([]);
  const [dapAnDaChon, setDapAnDaChon] = useState<DapAnDaChon>({});
  const [timeLeft, setTimeLeft] = useState(0); // Thời gian còn lại tính bằng giây
  const [showNopBaiDialog, setShowNopBaiDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load dữ liệu ban đầu
  useEffect(() => {
    const initBaiLam = async () => {
      if (!idBaiKiemTra) return;

      try {
        setLoading(true);

        // Lấy hoặc tạo bài làm
        let baiLamData: BaiLamSinhVien;
        try {
          baiLamData = await BaiLamSinhVienApi.layBaiLamSinhVien(Number(idBaiKiemTra));
        } catch (error: any) {
          if (error.response?.status === 404) {
            // Nếu chưa có bài làm thì tạo mới
            baiLamData = await BaiLamSinhVienApi.taoBaiLam(Number(idBaiKiemTra));
          } else {
            throw error;
          }
        }

        setBaiLam(baiLamData);

        // Lấy danh sách câu hỏi
        const cauHoi = await BaiLamSinhVienApi.layCauHoiBaiKiemTra(Number(idBaiKiemTra));
        setCauHoiList(cauHoi);

        // Khôi phục đáp án đã chọn
        const dapAnKhoiPhuc: DapAnDaChon = {};
        baiLamData.chiTietBaiLam?.forEach((chiTiet) => {
          if (chiTiet.mangIdDapAn && chiTiet.mangIdDapAn.length > 0) {
            dapAnKhoiPhuc[chiTiet.idCauHoiBaiKiemTra] = chiTiet.mangIdDapAn;
          }
        });
        setDapAnDaChon(dapAnKhoiPhuc);

        // Tính thời gian còn lại
        const thoiGianLam = baiLamData.baiKiemTra.thoiGianLam; // giây
        const thoiGianBatDau = new Date(baiLamData.thoiGianBatDau).getTime();
        const thoiGianHienTai = new Date().getTime();
        const thoiGianDaLam = Math.floor((thoiGianHienTai - thoiGianBatDau) / 1000);
        const thoiGianConLai = Math.max(0, thoiGianLam - thoiGianDaLam);
        
        setTimeLeft(thoiGianConLai);
      } catch (error) {
        console.error("Error initializing:", error);
        alert("Có lỗi xảy ra khi tải bài kiểm tra!");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    initBaiLam();
  }, [idBaiKiemTra, navigate]);

  // Đếm ngược thời gian
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Lưu đáp án mỗi 10 giây
  useEffect(() => {
    const autoSave = setInterval(() => {
      handleLuuTam();
    }, 10000);

    return () => clearInterval(autoSave);
  }, [dapAnDaChon]);

  // Format thời gian
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Xử lý chọn đáp án
  const handleChonDapAn = (idCauHoiBaiKiemTra: number, idDapAn: number, loaiCauHoi: string) => {
    setDapAnDaChon((prev) => {
      if (loaiCauHoi === "MotDung") {
        return {
          ...prev,
          [idCauHoiBaiKiemTra]: [idDapAn],
        };
      } else {
        // NhieuDung
        const current = prev[idCauHoiBaiKiemTra] || [];
        const index = current.indexOf(idDapAn);
        if (index > -1) {
          return {
            ...prev,
            [idCauHoiBaiKiemTra]: current.filter((id) => id !== idDapAn),
          };
        } else {
          return {
            ...prev,
            [idCauHoiBaiKiemTra]: [...current, idDapAn],
          };
        }
      }
    });
  };

  // Lưu tạm đáp án
  const handleLuuTam = async () => {
    if (!baiLam || Object.keys(dapAnDaChon).length === 0) return;

    try {
      const danhSachDapAn: UpdateDapAnDto[] = Object.entries(dapAnDaChon).map(
        ([idCauHoi, mangIdDapAn]) => ({
          idCauHoiBaiKiemTra: Number(idCauHoi),
          mangIdDapAn,
        })
      );

      await BaiLamSinhVienApi.luuTamDapAn(Number(idBaiKiemTra), danhSachDapAn);
    } catch (error) {
      console.error("Error saving answers:", error);
    }
  };

  // Nộp bài
  const handleNopBai = async () => {
    if (!baiLam) return;

    try {
      setIsSubmitting(true);
      
      // Lưu đáp án trước khi nộp
      await handleLuuTam();
      
      // Nộp bài
      await BaiLamSinhVienApi.nopBai(baiLam.id);
      
      alert("Nộp bài thành công!");
      navigate(-1);
    } catch (error) {
      console.error("Error submitting:", error);
      alert("Có lỗi xảy ra khi nộp bài!");
    } finally {
      setIsSubmitting(false);
      setShowNopBaiDialog(false);
    }
  };

  // Tự động nộp bài khi hết giờ
  const handleAutoSubmit = async () => {
    if (baiLam) {
      await handleLuuTam();
      await BaiLamSinhVienApi.nopBai(baiLam.id);
      alert("Hết giờ làm bài! Bài làm đã được tự động nộp.");
      navigate(-1);
    }
  };

  // Kiểm tra câu hỏi đã trả lời
  const isCauHoiDaTraLoi = (idCauHoiBaiKiemTra: number) => {
    return dapAnDaChon[idCauHoiBaiKiemTra]?.length > 0;
  };

  // Đếm số câu đã làm
  const soCauDaLam = Object.values(dapAnDaChon).filter((arr) => arr.length > 0).length;

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

  if (!baiLam) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Không tìm thấy bài làm!</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5", py: 3 }}>
      <Box sx={{ maxWidth: 1400, mx: "auto", px: 2 }}>
        <Grid container spacing={3}>
          {/* Phần câu hỏi - Bên trái */}
          <Grid>
            <Paper sx={{ p: 3, mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#e91e63", mb: 1 }}>
                {baiLam.baiKiemTra.tenBaiKiemTra}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng số câu: {cauHoiList.length} | Đã làm: {soCauDaLam}/{cauHoiList.length}
              </Typography>
            </Paper>

            {/* Danh sách câu hỏi */}
            {cauHoiList.map((item, index) => (
              <Paper key={item.id} sx={{ p: 3, mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
                  <Chip
                    label={`Câu ${index + 1}`}
                    color="primary"
                    size="small"
                    sx={{ mr: 2, fontWeight: 600 }}
                  />
                  {isCauHoiDaTraLoi(item.id) && (
                    <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 20 }} />
                  )}
                </Box>

                <Typography
                  variant="body1"
                  sx={{ fontWeight: 500, mb: 2 }}
                  dangerouslySetInnerHTML={{
                    __html: item.cauHoi.noiDungCauHoiHTML || item.cauHoi.noiDungCauHoi,
                  }}
                />

                {/* Đáp án - Một đúng */}
                {item.cauHoi.loaiCauHoi === "MotDung" && (
                  <RadioGroup
                    value={dapAnDaChon[item.id]?.[0] || ""}
                    onChange={(e) =>
                      handleChonDapAn(item.id, Number(e.target.value), "MotDung")
                    }
                  >
                    {item.cauHoi.dapAn.map((dapAn) => (
                      <FormControlLabel
                        key={dapAn.id}
                        value={dapAn.id}
                        control={<Radio />}
                        label={dapAn.noiDungDapAn}
                        sx={{
                          border: "1px solid #e0e0e0",
                          borderRadius: 1,
                          px: 2,
                          py: 0.5,
                          mb: 1,
                          "&:hover": {
                            backgroundColor: "#f5f5f5",
                          },
                        }}
                      />
                    ))}
                  </RadioGroup>
                )}

                {/* Đáp án - Nhiều đúng */}
                {item.cauHoi.loaiCauHoi === "NhieuDung" && (
                  <FormGroup>
                    {item.cauHoi.dapAn.map((dapAn) => (
                      <FormControlLabel
                        key={dapAn.id}
                        control={
                          <Checkbox
                            checked={dapAnDaChon[item.id]?.includes(dapAn.id) || false}
                            onChange={() => handleChonDapAn(item.id, dapAn.id, "NhieuDung")}
                          />
                        }
                        label={dapAn.noiDungDapAn}
                        sx={{
                          border: "1px solid #e0e0e0",
                          borderRadius: 1,
                          px: 2,
                          py: 0.5,
                          mb: 1,
                          "&:hover": {
                            backgroundColor: "#f5f5f5",
                          },
                        }}
                      />
                    ))}
                  </FormGroup>
                )}
              </Paper>
            ))}
          </Grid>

          {/* Phần thời gian và danh sách câu - Bên phải */}
          <Grid>
            <Paper
              sx={{
                p: 3,
                position: "sticky",
                top: 20,
              }}
            >
              {/* Đồng hồ đếm ngược */}
              <Box
                sx={{
                  textAlign: "center",
                  mb: 3,
                  p: 2,
                  backgroundColor: timeLeft < 300 ? "#ffebee" : "#e3f2fd",
                  borderRadius: 2,
                }}
              >
                <AccessTimeIcon
                  sx={{
                    fontSize: 40,
                    color: timeLeft < 300 ? "#f44336" : "#2196f3",
                    mb: 1,
                  }}
                />
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: timeLeft < 300 ? "#f44336" : "#2196f3",
                  }}
                >
                  {formatTime(timeLeft)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Thời gian còn lại
                </Typography>
              </Box>

              {/* Danh sách câu hỏi */}
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Danh sách câu hỏi
              </Typography>

              <Grid container spacing={1}>
                {cauHoiList.map((item, index) => (
                  <Grid>
                    <Button
                      variant={isCauHoiDaTraLoi(item.id) ? "contained" : "outlined"}
                      color={isCauHoiDaTraLoi(item.id) ? "success" : "inherit"}
                      sx={{
                        minWidth: 50,
                        minHeight: 50,
                        fontWeight: 600,
                      }}
                      onClick={() => {
                        const element = document.getElementById(`cau-${index}`);
                        element?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      {index + 1}
                    </Button>
                  </Grid>
                ))}
              </Grid>

              {/* Nút nộp bài */}
              <Button
                variant="contained"
                color="error"
                fullWidth
                size="large"
                sx={{
                  mt: 3,
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: "1.1rem",
                }}
                onClick={() => setShowNopBaiDialog(true)}
              >
                NỘP BÀI
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Dialog xác nhận nộp bài */}
      <Dialog open={showNopBaiDialog} onClose={() => setShowNopBaiDialog(false)}>
        <DialogTitle>Xác nhận nộp bài</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn đã hoàn thành {soCauDaLam}/{cauHoiList.length} câu hỏi.
          </Typography>
          <Typography sx={{ mt: 1 }}>
            Bạn có chắc chắn muốn nộp bài không?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNopBaiDialog(false)} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            onClick={handleNopBai}
            variant="contained"
            color="error"
            disabled={isSubmitting}
            startIcon={isSubmitting && <CircularProgress size={20} />}
          >
            {isSubmitting ? "Đang nộp..." : "Nộp bài"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LamBaiPage;
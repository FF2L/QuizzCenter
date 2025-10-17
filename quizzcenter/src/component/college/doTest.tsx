import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { BaiLamSinhVienApi, UpdateDapAnDto, BaiLamResponse } from "../../api/bai-lam-sinh-vien.api";

interface DapAnDaChon {
  [idCauHoiBaiKiemTra: number]: number[];
}

interface BaiKiemTraInfo {
  id: number;
  tenBaiKiemTra: string;
  loaiKiemTra: string;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  thoiGianLam: number;
}

const DoTestPage: React.FC = () => {
  const { idBaiKiemTra } = useParams<{ idBaiKiemTra: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const baiKiemTraInfo = location.state as BaiKiemTraInfo;

  const [loading, setLoading] = useState(true);
  const [baiLamData, setBaiLamData] = useState<BaiLamResponse | null>(null);
  const [dapAnDaChon, setDapAnDaChon] = useState<DapAnDaChon>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [showNopBaiDialog, setShowNopBaiDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load dữ liệu ban đầu
  useEffect(() => {
    const initBaiLam = async () => {
      if (!idBaiKiemTra) return;

      try {
        setLoading(true);

        // Kiểm tra xem đã có bài làm chưa
        const danhSachBaiLam = await BaiLamSinhVienApi.layBaiLamSinhVien(Number(idBaiKiemTra));
        
        let baiLamResponse: BaiLamResponse;

        if (danhSachBaiLam && danhSachBaiLam.length > 0) {
          // Tìm bài làm đang làm dở
          const baiLamDangLam = danhSachBaiLam.find((bl: any) => bl.trangThaiBaiLam === "DangLam");
          
          if (baiLamDangLam) {
            // Tiếp tục làm bài
            baiLamResponse = await BaiLamSinhVienApi.tiepTucLamBai(baiLamDangLam.id);
          } else {
            // Tạo bài làm mới
            baiLamResponse = await BaiLamSinhVienApi.taoBaiLam(Number(idBaiKiemTra));
          }
        } else {
          // Tạo bài làm mới
          baiLamResponse = await BaiLamSinhVienApi.taoBaiLam(Number(idBaiKiemTra));
        }

        setBaiLamData(baiLamResponse);

        // Khôi phục đáp án đã chọn
        const dapAnKhoiPhuc: DapAnDaChon = {};
        baiLamResponse.cauHoi.forEach((item) => {
          if (item.luaChon && item.luaChon.mangIdDapAn.length > 0) {
            dapAnKhoiPhuc[item.idCauHoiBaiKiemTra] = item.luaChon.mangIdDapAn;
          }
        });
        setDapAnDaChon(dapAnKhoiPhuc);

        // Tính thời gian còn lại
        const thoiGianLam = baiKiemTraInfo?.thoiGianLam || 3600;
        const thoiGianBatDau = new Date(baiLamResponse.baiLam.thoiGianBatDau).getTime();
        const thoiGianHienTai = new Date().getTime();
        const thoiGianDaLam = Math.floor((thoiGianHienTai - thoiGianBatDau) / 1000);
        const thoiGianConLai = Math.max(0, thoiGianLam - thoiGianDaLam);
        
        setTimeLeft(thoiGianConLai);
      } catch (error: any) {
        console.error("Error initializing:", error);
        alert(error.response?.data?.message || "Có lỗi xảy ra khi tải bài kiểm tra!");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    initBaiLam();
  }, [idBaiKiemTra, navigate, baiKiemTraInfo]);

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
    if (!baiLamData) return;

    const autoSave = setInterval(() => {
      handleLuuTam();
    }, 10000);

    return () => clearInterval(autoSave);
  }, [dapAnDaChon, baiLamData]);

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
    if (!baiLamData || Object.keys(dapAnDaChon).length === 0) return;

    try {
      const danhSachDapAn: UpdateDapAnDto[] = Object.entries(dapAnDaChon).map(
        ([idCauHoi, mangIdDapAn]) => ({
          idCauHoiBaiKiemTra: Number(idCauHoi),
          mangIdDapAn,
        })
      );

      await BaiLamSinhVienApi.luuTamDapAn(Number(idBaiKiemTra), danhSachDapAn);
      console.log("Đã lưu tạm đáp án");
    } catch (error) {
      console.error("Error saving answers:", error);
    }
  };

  // Nộp bài
  const handleNopBai = async () => {
    if (!baiLamData) return;

    try {
      setIsSubmitting(true);
      
      // Lưu đáp án trước khi nộp
      await handleLuuTam();
      
      // Nộp bài
      const result = await BaiLamSinhVienApi.nopBai(baiLamData.baiLam.id);
      
      alert(`Nộp bài thành công! Điểm: ${result.tongDiem}/10`);
      navigate(-1);
    } catch (error: any) {
      console.error("Error submitting:", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra khi nộp bài!");
    } finally {
      setIsSubmitting(false);
      setShowNopBaiDialog(false);
    }
  };

  // Tự động nộp bài khi hết giờ
  const handleAutoSubmit = async () => {
    if (baiLamData) {
      await handleLuuTam();
      await BaiLamSinhVienApi.nopBai(baiLamData.baiLam.id);
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
        {/* Phần câu hỏi - Bên trái */}
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
              <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
                <Chip label={`Câu ${index + 1}`} color="primary" size="small" sx={{ mr: 2, fontWeight: 600 }} />
                {isCauHoiDaTraLoi(item.idCauHoiBaiKiemTra) && (
                  <CheckCircleIcon sx={{ color: "#4caf50", fontSize: 20 }} />
                )}
              </Box>

              <Typography
                variant="body1"
                sx={{ fontWeight: 500, mb: 2 }}
                dangerouslySetInnerHTML={{
                  __html: item.cauHoi.noiDung || "",
                }}
              />

              {/* Đáp án */}
              {item.cauHoi.loai === "MotDung" ? (
                <RadioGroup
                  value={dapAnDaChon[item.idCauHoiBaiKiemTra]?.[0] || ""}
                  onChange={(e) => handleChonDapAn(item.idCauHoiBaiKiemTra, Number(e.target.value), "MotDung")}
                >
                  {item.dapAn.map((dapAn) => (
                    <FormControlLabel
                      key={dapAn.id}
                      value={dapAn.id}
                      control={<Radio />}
                      label={<span dangerouslySetInnerHTML={{ __html: dapAn.noiDung }} />}
                      sx={{
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                        px: 2,
                        py: 0.5,
                        mb: 1,
                        "&:hover": { backgroundColor: "#f5f5f5" },
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
                          onChange={() => handleChonDapAn(item.idCauHoiBaiKiemTra, dapAn.id, "NhieuDung")}
                        />
                      }
                      label={<span dangerouslySetInnerHTML={{ __html: dapAn.noiDung }} />}
                      sx={{
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                        px: 2,
                        py: 0.5,
                        mb: 1,
                        "&:hover": { backgroundColor: "#f5f5f5" },
                      }}
                    />
                  ))}
                </FormGroup>
              )}
            </Paper>
          ))}
        </Box>

        {/* Phần thời gian và danh sách câu - Bên phải */}
        <Box sx={{ flex: "1 1 30%", minWidth: 250, position: "sticky", top: 20, height: "fit-content" }}>
          <Paper sx={{ p: 3 }}>
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
                sx={{ fontSize: 40, color: timeLeft < 300 ? "#f44336" : "#2196f3", mb: 1 }}
              />
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: timeLeft < 300 ? "#f44336" : "#2196f3" }}
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

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {baiLamData.cauHoi.map((item, index) => (
                <Button
                  key={item.idCauHoiBaiKiemTra}
                  variant={isCauHoiDaTraLoi(item.idCauHoiBaiKiemTra) ? "contained" : "outlined"}
                  color={isCauHoiDaTraLoi(item.idCauHoiBaiKiemTra) ? "success" : "inherit"}
                  sx={{ minWidth: 50, minHeight: 50, fontWeight: 600 }}
                  onClick={() => {
                    const element = document.getElementById(`cau-${index}`);
                    element?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {index + 1}
                </Button>
              ))}
            </Box>

            {/* Nút nộp bài */}
            <Button
              variant="contained"
              color="error"
              fullWidth
              size="large"
              sx={{ mt: 3, py: 1.5, fontWeight: 600, fontSize: "1.1rem" }}
              onClick={() => setShowNopBaiDialog(true)}
            >
              NỘP BÀI
            </Button>
          </Paper>
        </Box>
      </Box>

      {/* Dialog xác nhận nộp bài */}
      <Dialog open={showNopBaiDialog} onClose={() => setShowNopBaiDialog(false)}>
        <DialogTitle>Xác nhận nộp bài</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn đã làm {soCauDaLam}/{baiLamData.cauHoi.length} câu.
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
          >
            {isSubmitting ? <CircularProgress size={24} /> : "Nộp bài"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DoTestPage;
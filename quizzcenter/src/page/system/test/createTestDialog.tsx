import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Box,
  Alert,
} from "@mui/material";

interface CreateBaiKiemTraDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: any) => void;
  idLopHocPhan: number;
}

const CreateBaiKiemTraDialog: React.FC<CreateBaiKiemTraDialogProps> = ({
  open,
  onClose,
  onCreate,
  idLopHocPhan,
}) => {
  const [tenBaiKiemTra, setTenBaiKiemTra] = useState("");
  const [loaiKiemTra, setLoaiKiemTra] = useState<"LuyenTap" | "BaiKiemTra">(
    "BaiKiemTra"
  );
  const [soLanLam, setSoLanLam] = useState(1);
  const [thoiGianBatDau, setThoiGianBatDau] = useState("");
  const [thoiGianKetThuc, setThoiGianKetThuc] = useState("");
  const [thoiGianLam, setThoiGianLam] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  // Tính toán min datetime cho các input
  const getMinStartTime = () => {
    const now = new Date();
    const minTime = new Date(now.getTime() + 1 * 60 * 1000); // Thêm 1 phút
    const tzOffset = minTime.getTimezoneOffset() * 60000;
    const localISOTime = new Date(minTime.getTime() - tzOffset)
      .toISOString()
      .slice(0, 16);
    return localISOTime;
  };

  const getMinEndTime = () => {
    if (!thoiGianBatDau) return getMinStartTime();
    // Thời gian kết thúc tối thiểu = thời gian bắt đầu + 1 phút
    const startDate = new Date(thoiGianBatDau);
    const minEndTime = new Date(startDate.getTime() + 1 * 60 * 1000);
    const tzOffset = minEndTime.getTimezoneOffset() * 60000;
    const localISOTime = new Date(minEndTime.getTime() - tzOffset)
      .toISOString()
      .slice(0, 16);
    return localISOTime;
  };

  const getMaxDuration = () => {
    if (!thoiGianBatDau || !thoiGianKetThuc) return 0;
    const start = new Date(thoiGianBatDau);
    const end = new Date(thoiGianKetThuc);
    const diffMinutes = Math.floor((end.getTime() - start.getTime()) / (60 * 1000));
    return diffMinutes > 0 ? diffMinutes : 0;
  };

  // Handler cho thời gian bắt đầu với validation
  const handleStartTimeChange = (value: string) => {
    setErrorMessage("");
    setThoiGianBatDau(value);
    
    if (value) {
      const selectedDate = new Date(value);
      const minTime = new Date(); // không cộng thêm phút nào
      
      // Validate đơn giản: chỉ check theo đúng giá trị user chọn
      if (selectedDate < minTime) {
        setErrorMessage(
          `⚠️ Thời gian bắt đầu (${selectedDate.toLocaleString('vi-VN')}) phải sau thời gian hiện tại (${new Date().toLocaleString('vi-VN')})`
        );
        return;
      }
      
      // Reset thời gian kết thúc nếu nó nhỏ hơn thời gian bắt đầu mới
      if (thoiGianKetThuc) {
        const end = new Date(thoiGianKetThuc);
        if (end <= selectedDate) {
          setThoiGianKetThuc("");
          setThoiGianLam(0);
        }
      }
    }
  };

  // Handler cho thời gian kết thúc với validation
  const handleEndTimeChange = (value: string) => {
    setErrorMessage("");
    setThoiGianKetThuc(value);
    
    if (value && thoiGianBatDau) {
      const startDate = new Date(thoiGianBatDau);
      const endDate = new Date(value);
      
      // Validate đơn giản: chỉ check theo đúng giá trị user chọn
      const diffMs = endDate.getTime() - startDate.getTime();
      
      if (diffMs < 60000) {
        setErrorMessage(
          `⚠️ Thời gian kết thúc (${endDate.toLocaleString('vi-VN')}) phải sau thời gian bắt đầu (${startDate.toLocaleString('vi-VN')}) ít nhất 1 phút!`
        );
        return;
      }
      
      // Auto-adjust thời gian làm nếu vượt quá
      if (thoiGianLam > 0) {
        const maxSeconds = diffMs / 1000;
        if (thoiGianLam > maxSeconds) {
          setThoiGianLam(0);
          setErrorMessage("⚠️ Thời gian làm đã bị reset vì vượt quá khoảng thời gian mở bài mới!");
        }
      }
    }
  };

  // Handler cho thời gian làm với validation
  const handleDurationChange = (value: string) => {
    const phut = Number(value);
    const giay = phut > 0 ? phut * 60 : 0;
    
    if (giay > 0 && thoiGianBatDau && thoiGianKetThuc) {
      const start = new Date(thoiGianBatDau);
      const end = new Date(thoiGianKetThuc);
      const maxSeconds = (end.getTime() - start.getTime()) / 1000;
      
      if (giay > maxSeconds) {
        setErrorMessage(
          `⚠️ Thời gian làm không được vượt quá ${Math.floor(maxSeconds / 60)} phút!`
        );
        return;
      }
    }
    
    setThoiGianLam(giay);
    setErrorMessage("");
  };

  const handleSubmit = () => {
    setErrorMessage("");

    // Validate tên
    if (!tenBaiKiemTra.trim()) {
      setErrorMessage("Vui lòng nhập tên bài kiểm tra!");
      return;
    }

    // Validate thời gian
    if (!thoiGianBatDau || !thoiGianKetThuc) {
      setErrorMessage("Vui lòng chọn thời gian bắt đầu và kết thúc!");
      return;
    }

    // Convert datetime-local sang Date object ĐỂ SO SÁNH ĐÚNG
    const batDauDate = new Date(thoiGianBatDau);
    const ketThucDate = new Date(thoiGianKetThuc);
    const now = new Date();

    // Check 1: Thời gian bắt đầu phải sau thời gian hiện tại ít nhất 5 phút
    const minStartTime = new Date(now.getTime() + 5 * 60 * 1000);
    if (batDauDate < minStartTime) {
      setErrorMessage(
        "Thời gian bắt đầu phải sau thời gian hiện tại ít nhất 5 phút!"
      );
      return;
    }

    // Check 2: Thời gian kết thúc phải sau thời gian bắt đầu ít nhất 1 phút
    const diffMs = ketThucDate.getTime() - batDauDate.getTime();
    if (diffMs < 60000) {
      setErrorMessage("Thời gian kết thúc phải sau thời gian bắt đầu ít nhất 1 phút!");
      return;
    }

    // Check 3: Validate thời gian làm cho bài kiểm tra
    if (loaiKiemTra === "BaiKiemTra") {
      if (thoiGianLam <= 0) {
        setErrorMessage("Thời gian làm phải lớn hơn 0!");
        return;
      }

      // Khoảng thời gian giữa bắt đầu và kết thúc (tính bằng giây)
      const khoangThoiGian = (ketThucDate.getTime() - batDauDate.getTime()) / 1000;

      // Thời gian làm phải nhỏ hơn hoặc bằng khoảng thời gian mở bài
      if (thoiGianLam > khoangThoiGian) {
        setErrorMessage(
          `Thời gian làm (${thoiGianLam / 60} phút) không được vượt quá khoảng thời gian mở bài (${Math.floor(khoangThoiGian / 60)} phút)!`
        );
        return;
      }
    }

    // Nếu là Luyện tập → gán mặc định 60 phút (3600 giây)
    const finalThoiGianLam = loaiKiemTra === "LuyenTap" ? 60 * 60 : thoiGianLam;

    // Convert sang ISO string SAU KHI validate
    const thoiGianBatDauISO = batDauDate.toISOString();
    const thoiGianKetThucISO = ketThucDate.toISOString();

    const payload = {
      tenBaiKiemTra: tenBaiKiemTra.trim(),
      loaiKiemTra,
      thoiGianBatDau: thoiGianBatDauISO,
      thoiGianKetThuc: thoiGianKetThucISO,
      thoiGianLam: finalThoiGianLam,
      idLopHocPhan,
    };

    onCreate(payload);
    resetForm();
  };

  const resetForm = () => {
    setTenBaiKiemTra("");
    setLoaiKiemTra("BaiKiemTra");
    setSoLanLam(1);
    setThoiGianBatDau("");
    setThoiGianKetThuc("");
    setThoiGianLam(0);
    setErrorMessage("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          handleClose();
        }
      }}
      fullWidth
      maxWidth="md"
    >
      <Box sx={{ backgroundColor: "#245D51" }}>
        <DialogTitle color="white">Tạo bài kiểm tra mới</DialogTitle>
      </Box>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
      >
        {errorMessage && (
          <Alert severity="error" onClose={() => setErrorMessage("")}>
            {errorMessage}
          </Alert>
        )}

        <TextField
          label="Tên bài kiểm tra"
          value={tenBaiKiemTra}
          onChange={(e) => setTenBaiKiemTra(e.target.value)}
          fullWidth
          required
          placeholder="Nhập tên bài kiểm tra..."
        />

        <TextField
          select
          label="Loại kiểm tra"
          value={loaiKiemTra}
          onChange={(e) =>
            setLoaiKiemTra(e.target.value as "LuyenTap" | "BaiKiemTra")
          }
          fullWidth
          required
        >
          <MenuItem value="BaiKiemTra">Bài kiểm tra</MenuItem>
          <MenuItem value="LuyenTap">Bài luyện tập</MenuItem>
        </TextField>

        {loaiKiemTra === "BaiKiemTra" && (
          <Box
            sx={{
              p: 2,
              backgroundColor: "#f5f5f5",
              borderRadius: 1,
              fontSize: "14px",
              color: "#666",
            }}
          >
            ℹ️ Bài kiểm tra chỉ cho phép sinh viên làm 1 lần
          </Box>
        )}

        <TextField
          type="datetime-local"
          label="Thời gian bắt đầu"
          value={thoiGianBatDau}
          onChange={(e) => handleStartTimeChange(e.target.value)}
          fullWidth
          required
          InputLabelProps={{ shrink: true }}
          inputProps={{ 
            min: getMinStartTime()
          }}
          helperText="Phải sau thời gian hiện tại"
        />

        <TextField
          type="datetime-local"
          label="Thời gian kết thúc"
          value={thoiGianKetThuc}
          onChange={(e) => handleEndTimeChange(e.target.value)}
          fullWidth
          required
          InputLabelProps={{ shrink: true }}
          inputProps={{ 
            min: getMinEndTime(),
            disabled: !thoiGianBatDau,
            step: 60 // Force minute selection
          }}
          disabled={!thoiGianBatDau}
          helperText={
            thoiGianBatDau 
              ? `Phải sau ${new Date(thoiGianBatDau).toLocaleString('vi-VN')}` 
              : "Chọn thời gian bắt đầu trước"
          }
        />

        {loaiKiemTra === "BaiKiemTra" && (
          <TextField
            type="number"
            label="Thời gian làm (phút)"
            value={thoiGianLam > 0 ? thoiGianLam / 60 : ""}
            onChange={(e) => handleDurationChange(e.target.value)}
            fullWidth
            required
            disabled={!thoiGianBatDau || !thoiGianKetThuc}
            inputProps={{ 
              min: 1,
              max: getMaxDuration()
            }}
            placeholder="Nhập thời gian làm bài (phút)"
            helperText={
              getMaxDuration() > 0 
                ? `Tối đa: ${getMaxDuration()} phút (dựa trên khoảng thời gian mở bài)`
                : "Chọn thời gian bắt đầu và kết thúc trước"
            }
          />
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          color="secondary"
          variant="outlined"
          onClick={handleClose}
          sx={{ minWidth: 100 }}
        >
          Hủy
        </Button>
        <Button
          sx={{ backgroundColor: "#245D51", minWidth: 100 }}
          variant="contained"
          onClick={handleSubmit}
        >
          Tạo
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateBaiKiemTraDialog;
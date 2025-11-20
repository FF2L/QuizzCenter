import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Box,
  Button,
  Alert,
} from "@mui/material";
import { BaiKiemTra } from "../../../common/model";

interface UpdateBaiKiemTraDialogProps {
  open: boolean;
  onClose: () => void;
  baiKiemTra: BaiKiemTra | null;
  onUpdate: (id: number, payload: any) => void;
}

const UpdateBaiKiemTraDialog: React.FC<UpdateBaiKiemTraDialogProps> = ({
  open,
  onClose,
  baiKiemTra,
  onUpdate,
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

  // Utils format
  const toLocalDatetime = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const tzOffset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - tzOffset)
      .toISOString()
      .slice(0, 16);
    return localISOTime;
  };

  const toUTCISOString = (localDatetime: string) => {
    if (!localDatetime) return "";
    return new Date(localDatetime).toISOString();
  };

  // Fill data khi mở dialog
  useEffect(() => {
    if (baiKiemTra) {
      setTenBaiKiemTra(baiKiemTra.tenBaiKiemTra);
      setLoaiKiemTra(baiKiemTra.loaiKiemTra as "LuyenTap" | "BaiKiemTra");
      setSoLanLam(baiKiemTra.soLanLam);
      setThoiGianBatDau(toLocalDatetime(baiKiemTra.thoiGianBatDau));
      setThoiGianKetThuc(toLocalDatetime(baiKiemTra.thoiGianKetThuc));
      setThoiGianLam(baiKiemTra.thoiGianLam);
      setErrorMessage("");
    }
  }, [baiKiemTra]);

  // Check trạng thái bài kiểm tra
  const now = new Date();
  const startDate = thoiGianBatDau ? new Date(thoiGianBatDau) : null;
  const endDate = thoiGianKetThuc ? new Date(thoiGianKetThuc) : null;

  const isEnded = endDate ? endDate <= now : false;
  const hasStarted = startDate ? startDate <= now : false;

  const disableStartTime = isEnded || hasStarted;
  const disableEndTime = isEnded;

  // Tính toán min datetime cho các input
  const getMinStartTime = () => {
    if (hasStarted || isEnded) return "";
    const now = new Date();
    const minTime = new Date(now.getTime() + 5 * 60 * 1000);
    const tzOffset = minTime.getTimezoneOffset() * 60000;
    const localISOTime = new Date(minTime.getTime() - tzOffset)
      .toISOString()
      .slice(0, 16);
    return localISOTime;
  };

  const getMinEndTime = () => {
    if (isEnded) return "";
    if (!thoiGianBatDau) return getMinStartTime();
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
    
    if (value && !hasStarted && !isEnded) {
      const selectedDate = new Date(value);
      const minTime = new Date(Date.now() + 5 * 60 * 1000);
      
      if (selectedDate < minTime) {
        setErrorMessage("⚠️ Thời gian bắt đầu phải sau thời gian hiện tại ít nhất 5 phút!");
        return;
      }
    }
    
    setThoiGianBatDau(value);
    
    // Reset thời gian kết thúc nếu nó nhỏ hơn thời gian bắt đầu mới
    if (value && thoiGianKetThuc) {
      const start = new Date(value);
      const end = new Date(thoiGianKetThuc);
      if (end <= start) {
        setThoiGianKetThuc("");
        setThoiGianLam(0);
      }
    }
  };

  // Handler cho thời gian kết thúc với validation
  const handleEndTimeChange = (value: string) => {
    setThoiGianKetThuc(value);
    setErrorMessage("");
    
    if (value && thoiGianBatDau) {
      const startDate = new Date(thoiGianBatDau);
      const endDate = new Date(value);
      
      if (endDate <= startDate) {
        setErrorMessage("⚠️ Thời gian kết thúc phải sau thời gian bắt đầu!");
        setThoiGianKetThuc("");
        setThoiGianLam(0);
        return;
      }
      
      // Auto-adjust thời gian làm nếu vượt quá
      if (thoiGianLam > 0) {
        const maxSeconds = (endDate.getTime() - startDate.getTime()) / 1000;
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
    if (!baiKiemTra) return;
    setErrorMessage("");

    if (!tenBaiKiemTra.trim()) {
      setErrorMessage("Vui lòng nhập tên bài kiểm tra!");
      return;
    }

    if (!thoiGianBatDau || !thoiGianKetThuc) {
      setErrorMessage("Vui lòng chọn thời gian bắt đầu và kết thúc!");
      return;
    }

    const thoiGianBatDauISO = toUTCISOString(thoiGianBatDau);
    const thoiGianKetThucISO = toUTCISOString(thoiGianKetThuc);
    const batDauDate = new Date(thoiGianBatDauISO);
    const ketThucDate = new Date(thoiGianKetThucISO);

    // Chỉ check thời gian bắt đầu nếu chưa bắt đầu
    if (!hasStarted && !isEnded) {
      const minStartTime = new Date(now.getTime() + 5 * 60 * 1000);
      if (batDauDate < minStartTime) {
        setErrorMessage("Thời gian bắt đầu phải sau thời gian hiện tại ít nhất 5 phút!");
        return;
      }
    }

    if (ketThucDate <= batDauDate) {
      setErrorMessage("Thời gian kết thúc phải sau thời gian bắt đầu!");
      return;
    }

    if (loaiKiemTra === "BaiKiemTra") {
      if (thoiGianLam <= 0) {
        setErrorMessage("Thời gian làm phải lớn hơn 0!");
        return;
      }

      const khoangThoiGian = (ketThucDate.getTime() - batDauDate.getTime()) / 1000;
      if (thoiGianLam > khoangThoiGian) {
        setErrorMessage(
          `Thời gian làm (${thoiGianLam / 60} phút) không được vượt quá khoảng thời gian mở bài (${Math.floor(khoangThoiGian / 60)} phút)!`
        );
        return;
      }
    }

    const payload = {
      tenBaiKiemTra: tenBaiKiemTra.trim(),
      loaiKiemTra,
      thoiGianBatDau: thoiGianBatDauISO,
      thoiGianKetThuc: thoiGianKetThucISO,
      thoiGianLam: loaiKiemTra === "LuyenTap" ? 60 * 60 : thoiGianLam,
      idLopHocPhan: baiKiemTra.idLopHocPhan,
    };

    onUpdate(baiKiemTra.id, payload);
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason !== "backdropClick") onClose();
      }}
      fullWidth
      maxWidth="md"
    >
      <Box sx={{ backgroundColor: "#245D51" }}>
        <DialogTitle color="white">Cập nhật bài kiểm tra</DialogTitle>
      </Box>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
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
          fullWidth
          required
          disabled
        >
          <MenuItem value="BaiKiemTra">Bài kiểm tra</MenuItem>
          <MenuItem value="LuyenTap">Bài luyện tập</MenuItem>
        </TextField>
        {loaiKiemTra === "BaiKiemTra" && (
          <Box sx={{ p: 2, backgroundColor: "#f5f5f5", borderRadius: 1, fontSize: 14, color: "#666" }}>
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
          disabled={disableStartTime}
          helperText={
            disableStartTime 
              ? "Không thể chỉnh sửa (đã bắt đầu hoặc kết thúc)"
              : "Phải sau thời gian hiện tại ít nhất 5 phút"
          }
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
            min: getMinEndTime()
          }}
          disabled={disableEndTime}
          helperText={
            disableEndTime
              ? "Không thể chỉnh sửa (đã kết thúc)"
              : thoiGianBatDau 
                ? "Phải sau thời gian bắt đầu" 
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
        <Button color="secondary" variant="outlined" onClick={onClose} sx={{ minWidth: 100 }}>
          Hủy
        </Button>
        <Button sx={{ backgroundColor: "#245D51", minWidth: 100 }} variant="contained" onClick={handleSubmit}>
          Cập nhật
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateBaiKiemTraDialog;
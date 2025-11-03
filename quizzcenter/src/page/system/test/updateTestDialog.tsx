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

  // Tính max duration
  const getMaxDuration = () => {
    if (!startDate || !endDate) return 0;
    const diffMinutes = Math.floor((endDate.getTime() - startDate.getTime()) / 60000);
    return diffMinutes > 0 ? diffMinutes : 0;
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

    if (batDauDate > ketThucDate) {
      setErrorMessage("Thời gian kết thúc phải sau thời gian bắt đầu!");
      return;
    }

    if (loaiKiemTra === "BaiKiemTra" && thoiGianLam <= 0) {
      setErrorMessage("Thời gian làm phải lớn hơn 0!");
      return;
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
          disabled // khóa loại bài
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
          onChange={(e) => setThoiGianBatDau(e.target.value)}
          fullWidth
          required
          InputLabelProps={{ shrink: true }}
          disabled={disableStartTime}
        />

        <TextField
          type="datetime-local"
          label="Thời gian kết thúc"
          value={thoiGianKetThuc}
          onChange={(e) => setThoiGianKetThuc(e.target.value)}
          fullWidth
          required
          InputLabelProps={{ shrink: true }}
          disabled={disableEndTime}
        />

        {loaiKiemTra === "BaiKiemTra" && (
          <TextField
            type="number"
            label="Thời gian làm (phút)"
            value={thoiGianLam > 0 ? thoiGianLam / 60 : ""}
            onChange={(e) => {
              const phut = Number(e.target.value);
              setThoiGianLam(phut > 0 ? phut * 60 : 0);
            }}
            fullWidth
            required
            inputProps={{ min: 1, max: getMaxDuration() }}
            placeholder="Nhập thời gian làm bài (phút)"
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

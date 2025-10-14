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
    "LuyenTap"
  );
  const [soLanLam, setSoLanLam] = useState(1);
  const [thoiGianBatDau, setThoiGianBatDau] = useState("");
  const [thoiGianKetThuc, setThoiGianKetThuc] = useState("");
  const [thoiGianLam, setThoiGianLam] = useState(0);

  // Khi mở dialog thì fill data cũ vào form
  useEffect(() => {
    if (baiKiemTra) {
      setTenBaiKiemTra(baiKiemTra.tenBaiKiemTra);
      setLoaiKiemTra(baiKiemTra.loaiKiemTra as "LuyenTap" | "BaiKiemTra");
      setSoLanLam(baiKiemTra.soLanLam);
      setThoiGianBatDau(toLocalDatetime(baiKiemTra.thoiGianBatDau));
      setThoiGianKetThuc(toLocalDatetime(baiKiemTra.thoiGianKetThuc));
      setThoiGianLam(baiKiemTra.thoiGianLam);
    }
  }, [baiKiemTra]);
  

  const handleSubmit = () => {
    if (!baiKiemTra) return;

    const payload = {
      tenBaiKiemTra,
      loaiKiemTra,
      soLanLam: loaiKiemTra === "BaiKiemTra" ? 1 : soLanLam,
      xemBaiLam: true,
      hienThiKetQua: true,
      thoiGianBatDau,
      thoiGianKetThuc,
      thoiGianLam,
      idLopHocPhan: baiKiemTra.idLopHocPhan,
    };

    onUpdate(baiKiemTra.id, payload);
  };
// utils format
const toLocalDatetime = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const tzOffset = date.getTimezoneOffset() * 60000; // ms
    const localISOTime = new Date(date.getTime() - tzOffset)
      .toISOString()
      .slice(0, 16);
    return localISOTime;
  };
  const toUTCISOString = (localDatetime: string) => {
    if (!localDatetime) return "";
    return new Date(localDatetime).toISOString();
  };
  
  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        if (reason !== "backdropClick") {
          onClose();
        }
      }}
      fullWidth
      maxWidth="md"
    >
      <Box sx={{backgroundColor:"#245D51"}}>
      <DialogTitle color="white">Cập nhật bài kiểm tra</DialogTitle>
      </Box>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
        <TextField
          label="Tên bài kiểm tra"
          value={tenBaiKiemTra}
          onChange={(e) => setTenBaiKiemTra(e.target.value)}
          fullWidth
        />

        <TextField
          select
          label="Loại kiểm tra"
          value={loaiKiemTra}
          onChange={(e) =>
            setLoaiKiemTra(e.target.value as "LuyenTap" | "BaiKiemTra")
          }
          fullWidth
        >
          <MenuItem value="LuyenTap">Luyện tập</MenuItem>
          <MenuItem value="BaiKiemTra">Bài kiểm tra</MenuItem>
        </TextField>

        {loaiKiemTra === "LuyenTap" && (
          <TextField
            type="number"
            label="Số lần làm"
            value={soLanLam}
            onChange={(e) => setSoLanLam(Number(e.target.value))}
            fullWidth
          />
        )}

        <TextField
          type="datetime-local"
          label="Thời gian bắt đầu"
          value={thoiGianBatDau}
          onChange={(e) => setThoiGianBatDau(e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          type="datetime-local"
          label="Thời gian kết thúc"
          value={thoiGianKetThuc}
          onChange={(e) => setThoiGianKetThuc(e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          type="number"
          label="Thời gian làm (phút)"
          value={thoiGianLam / 60}
          onChange={(e) => setThoiGianLam(Number(e.target.value) * 60)}
          fullWidth
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button   sx={{backgroundColor:"#245D51"}} variant="contained" onClick={handleSubmit}>
          Cập nhật
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateBaiKiemTraDialog;

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
    "LuyenTap"
  );
  const [soLanLam, setSoLanLam] = useState(1);
  const [thoiGianBatDau, setThoiGianBatDau] = useState("");
  const [thoiGianKetThuc, setThoiGianKetThuc] = useState("");
  const [thoiGianLam, setThoiGianLam] = useState(0);

  const handleSubmit = () => {
    const payload = {
      tenBaiKiemTra,
      loaiKiemTra,
      soLanLam: loaiKiemTra === "BaiKiemTra" ? 1 : soLanLam,
      xemBaiLam: true,
      hienThiKetQua: true,
      thoiGianBatDau,
      thoiGianKetThuc,
      thoiGianLam,
      idLopHocPhan,
    };
    onCreate(payload);

    // reset form
    setTenBaiKiemTra("");
    setLoaiKiemTra("LuyenTap");
    setSoLanLam(1);
    setThoiGianBatDau("");
    setThoiGianKetThuc("");
    setThoiGianLam(0);
  };

  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        // Không cho đóng dialog khi click ra ngoài
        if (reason !== "backdropClick") {
          onClose();
        }
      }}
      fullWidth
      maxWidth="md"
    >
      <Box sx={{backgroundColor:"#245D51"}}>
      <DialogTitle color="white">Tạo bài kiểm tra mới</DialogTitle>
      </Box>
      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
      >
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
        <Button sx={{backgroundColor:"#245D51"}} variant="contained" onClick={handleSubmit}>
          Tạo
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateBaiKiemTraDialog;

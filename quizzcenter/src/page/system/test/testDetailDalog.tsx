// src/page/system/test/ViewBaiKiemTraDialog.tsx
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stack,
} from "@mui/material";
import { BaiKiemTra } from "../../../common/model";

interface Props {
  open: boolean;
  onClose: () => void;
  idBaiKiemTra: number | null;
}

const ViewBaiKiemTraDialog: React.FC<Props> = ({ open, onClose, idBaiKiemTra }) => {
  const [detail, setDetail] = useState<BaiKiemTra | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && idBaiKiemTra) {
      const fetchDetail = async () => {
        try {
          setLoading(true);
          const res = await fetch(`http://localhost:3000/bai-kiem-tra/findone/${idBaiKiemTra}`);
          const data: BaiKiemTra = await res.json();
          setDetail(data);
        } catch (error) {
          console.error("Lỗi fetch chi tiết:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchDetail();
    }
  }, [open, idBaiKiemTra]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <Box sx={{backgroundColor:"#245D51"}}>
      <DialogTitle color="white">Chi tiết bài kiểm tra</DialogTitle>
      </Box>
      <DialogContent dividers>
        {loading && <Typography>Đang tải...</Typography>}
        {!loading && detail && (
          <Stack spacing={1}>
            <Typography><b>Tên:</b> {detail.tenBaiKiemTra}</Typography>
            <Typography><b>Loại kiểm tra:</b> {detail.loaiKiemTra}</Typography>
            <Typography><b>Số lần làm:</b> {detail.soLanLam}</Typography>
            {/* <Typography><b>Xem bài làm:</b> {detail.xemBaiLam ? "Có" : "Không"}</Typography>
            <Typography><b>Hiển thị kết quả:</b> {detail.hienThiKetQua ? "Có" : "Không"}</Typography> */}
            <Typography>
              <b>Thời gian bắt đầu:</b>{" "}
              {new Date(detail.thoiGianBatDau).toLocaleString()}
            </Typography>
            <Typography>
              <b>Thời gian kết thúc:</b>{" "}
              {new Date(detail.thoiGianKetThuc).toLocaleString()}
            </Typography>
            <Typography><b>Thời gian làm:</b> {detail.thoiGianLam / 60} phút</Typography>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewBaiKiemTraDialog;

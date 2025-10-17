import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, Button, Paper } from "@mui/material";
import dayjs from "dayjs";

interface BaiKiemTra {
  id: number;
  tenBaiKiemTra: string;
  loaiKiemTra: string;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  thoiGianLam: number;
}

const CollegeTestDetail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const baiKiemTra = location.state as BaiKiemTra;

  const [trangThai, setTrangThai] = useState("");

  useEffect(() => {
    if (!baiKiemTra) return;

    const now = dayjs();
    const batDau = dayjs(baiKiemTra.thoiGianBatDau);
    const ketThuc = dayjs(baiKiemTra.thoiGianKetThuc);

    if (now.isBefore(batDau)) {
      setTrangThai("chuaBatDau");
    } else if (now.isAfter(ketThuc)) {
      setTrangThai("daKetThuc");
    } else {
      setTrangThai("dangDienRa");
    }
  }, [baiKiemTra]);

  const handleLamBai = () => {
    navigate(`/quizzcenter/lam-bai/${baiKiemTra.id}`, {
      state: {
        baiKiemTra: baiKiemTra  // Truyền toàn bộ thông tin
      }
    });
  };

  if (!baiKiemTra) {
    return <Typography>Không tìm thấy thông tin bài kiểm tra.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#e91e63" }}>
          {baiKiemTra.tenBaiKiemTra}
        </Typography>
        <Typography sx={{ mt: 2 }}>
          <strong>Loại:</strong> {baiKiemTra.loaiKiemTra === "BaiKiemTra" ? "Bài kiểm tra" : "Luyện tập"}
        </Typography>
        <Typography>
          <strong>Bắt đầu:</strong> {dayjs(baiKiemTra.thoiGianBatDau).format("HH:mm DD/MM/YYYY")}
        </Typography>
        <Typography>
          <strong>Kết thúc:</strong> {dayjs(baiKiemTra.thoiGianKetThuc).format("HH:mm DD/MM/YYYY")}
        </Typography>
        <Typography>
          <strong>Thời gian làm:</strong> {Math.floor(baiKiemTra.thoiGianLam / 60)} phút
        </Typography>
      </Paper>

      {/* Trạng thái thời gian */}
      {trangThai === "chuaBatDau" && (
        <Typography sx={{ color: "orange", fontWeight: 600 }}>
          ❌ Bài kiểm tra chưa đến thời gian bắt đầu
        </Typography>
      )}
      {trangThai === "daKetThuc" && (
        <Typography sx={{ color: "red", fontWeight: 600 }}>
          ⏰ Đã hết thời gian làm bài
        </Typography>
      )}
      {trangThai === "dangDienRa" && (
        <Button 
          variant="contained" 
          color="success" 
          onClick={handleLamBai}
          size="large"
          sx={{
            py: 1.5,
            px: 4,
            fontWeight: 600,
            fontSize: "1.1rem"
          }}
        >
          Làm bài ngay
        </Button>
      )}
    </Box>
  );
};

export default CollegeTestDetail;
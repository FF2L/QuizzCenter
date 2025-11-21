// ThongKeBangDiemContent.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Stack,
  CircularProgress,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { LectureService } from "../../../services/lecture.api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface ThongKeDiem {
  diemCaoNhat: number;
  diemThapNhat: number;
  diemTrungBinh: number;
  soSVCoDiemLonHon5: number;
  soSVCoDiemBeHon5: number;
  soSVCoDiemBang10: number;
  soSVCoDiemBHB1: number;
  soSVCoDiemBHB2: number;
  soSVCoDiemBHB3: number;
  soSVCoDiemBHB4: number;
  soSVCoDiemBHB5: number;
  soSVCoDiemBHB6: number;
  soSVCoDiemBHB7: number;
  soSVCoDiemBHB8: number;
  soSVCoDiemBHB9: number;
  soSVCoDiemBHB10: number;
}

const ThongKeBangDiemContent = () => {
  const { idLopHocPhan, idBaiKiemTra } = useParams<{
    idLopHocPhan: string;
    idBaiKiemTra: string;
  }>();

  const [thongKe, setThongKe] = useState<ThongKeDiem | null>(null);
  const [loading, setLoading] = useState(false);

  const accessToken = localStorage.getItem("accessTokenGV") || "";

  // Fetch thống kê
  const fetchThongKe = async () => {
    try {
      setLoading(true);
      const response = await LectureService.thongKeBangDiem(
        accessToken,
        Number(idLopHocPhan),
        Number(idBaiKiemTra)
      );

      if (response.ok) {
        setThongKe(response.data);
      } else {
        console.error("Lỗi khi tải thống kê:", response.error);
        alert("Không thể tải thống kê!");
      }
    } catch (error) {
      console.error("Lỗi fetch thống kê:", error);
      alert("Có lỗi xảy ra khi tải thống kê.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && idLopHocPhan && idBaiKiemTra) {
      fetchThongKe();
    }
  }, [idLopHocPhan, idBaiKiemTra]);

  // Chuẩn bị dữ liệu cho biểu đồ cột
  const chartData = thongKe
    ? [
        { diem: "0-1", soLuong: thongKe.soSVCoDiemBHB1 },
        { diem: "1-2", soLuong: thongKe.soSVCoDiemBHB2 },
        { diem: "2-3", soLuong: thongKe.soSVCoDiemBHB3 },
        { diem: "3-4", soLuong: thongKe.soSVCoDiemBHB4 },
        { diem: "4-5", soLuong: thongKe.soSVCoDiemBHB5 },
        { diem: "5-6", soLuong: thongKe.soSVCoDiemBHB6 },
        { diem: "6-7", soLuong: thongKe.soSVCoDiemBHB7 },
        { diem: "7-8", soLuong: thongKe.soSVCoDiemBHB8 },
        { diem: "8-9", soLuong: thongKe.soSVCoDiemBHB9 },
        { diem: "9-10", soLuong: thongKe.soSVCoDiemBHB10 },
      ]
    : [];

  const getBarColor = (diem: string) => {
    const diemSo = parseFloat(diem.split("-")[0]);
    if (diemSo < 5) return "#f44336";
    if (diemSo < 7) return "#ff9800";
    if (diemSo < 8.5) return "#2196f3";
    return "#4caf50";
  };

  const tongSV = thongKe
    ? thongKe.soSVCoDiemLonHon5 + thongKe.soSVCoDiemBeHon5
    : 0;
  const tyLeDat = tongSV > 0 
    ? ((thongKe!.soSVCoDiemLonHon5 / tongSV) * 100).toFixed(1) 
    : "0.0";

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!thongKe) {
    return (
      <Box
        sx={{
          backgroundColor: "white",
          p: 5,
          borderRadius: 2,
          textAlign: "center",
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Không có dữ liệu thống kê
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {/* Cards thống kê tổng quan */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              borderRadius: 2,
            }}
          >
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.7, mb: 1 }}>
                    Điểm cao nhất
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="#667eea">
                    {thongKe.diemCaoNhat.toFixed(1)}
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 48, opacity: 0.5, color: "#667eea" }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              borderRadius: 2,
            }}
          >
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.7, mb: 1 }}>
                    Điểm thấp nhất
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="#f093fb">
                    {thongKe.diemThapNhat.toFixed(1)}
                  </Typography>
                </Box>
                <TrendingDownIcon sx={{ fontSize: 48, opacity: 0.5, color: "#f093fb" }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              borderRadius: 2,
            }}
          >
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.7, mb: 1 }}>
                    Điểm trung bình
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="#4facfe">
                    {thongKe.diemTrungBinh.toFixed(2)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    backgroundColor: "#e3f2fd",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#4facfe",
                  }}
                >
                  Ø
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              borderRadius: 2,
            }}
          >
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.7, mb: 1 }}>
                    Điểm 10
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="#43e97b">
                    {thongKe.soSVCoDiemBang10}
                  </Typography>
                </Box>
                <EmojiEventsIcon sx={{ fontSize: 48, opacity: 0.5, color: "#43e97b" }} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Thông tin chi tiết */}
      <Grid container spacing={3}>
        {/* Biểu đồ */}
        {/* Biểu đồ với chú thích màu */}
<Grid item xs={12} md={8} sx={{ position: "relative" }}>
  <Paper
    sx={{
      p: 3,
      borderRadius: 2,
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      position: "relative",
    }}
  >
    <Typography variant="h6" fontWeight={600} mb={3}>
      Phân bố điểm
    </Typography>
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="diem"
          tick={{ fill: "#666", fontSize: 14 }}
          label={{
            value: "Khoảng điểm",
            position: "insideBottom",
            offset: -5,
            style: { fill: "#666", fontWeight: 600 },
          }}
        />
        <YAxis
          tick={{ fill: "#666", fontSize: 14 }}
          label={{
            value: "Số sinh viên",
            angle: -90,
            position: "insideLeft",
            style: { fill: "#666", fontWeight: 600 },
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: 8,
          }}
          formatter={(value) => [`${value} sinh viên`, "Số lượng"]}
        />
        <Bar dataKey="soLuong" radius={[8, 8, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={getBarColor(entry.diem)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>

    {/* Chú thích màu */}
    <Box
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 2,
        mt: 2,
        flexWrap: "wrap",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ width: 16, height: 16, backgroundColor: "#f44336", borderRadius: 1 }} />
        <Typography variant="body2">Điểm thấp (&lt;5)</Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ width: 16, height: 16, backgroundColor: "#ff9800", borderRadius: 1 }} />
        <Typography variant="body2">Trung bình (5-7)</Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ width: 16, height: 16, backgroundColor: "#2196f3", borderRadius: 1 }} />
        <Typography variant="body2">Khá (7-8.5)</Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ width: 16, height: 16, backgroundColor: "#4caf50", borderRadius: 1 }} />
        <Typography variant="body2">Cao (&gt;8.5)</Typography>
      </Box>
    </Box>
  </Paper>
</Grid>


        {/* Thống kê bổ sung */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              height: "100%",
            }}
          >
            <Typography variant="h6" fontWeight={600} mb={3}>
              Thống kê chi tiết
            </Typography>

            <Stack spacing={3}>
              <Box>
                <Typography variant="body2" mb={1}>
                  Tổng số sinh viên
                </Typography>
                <Typography variant="h5" fontWeight={600} color="#245D51">
                  {tongSV}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  backgroundColor: "#e8f5e9",
                  borderRadius: 2,
                  border: "2px solid #4caf50",
                }}
              >
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Sinh viên đạt (≥5)
                </Typography>
                <Typography variant="h5" fontWeight={600} color="#4caf50">
                  {thongKe.soSVCoDiemLonHon5}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Tỷ lệ: {tyLeDat}%
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2,
                  backgroundColor: "#ffebee",
                  borderRadius: 2,
                  border: "2px solid #f44336",
                }}
              >
                <Typography variant="body2" color="text.secondary" mb={1}>
                  Sinh viên không đạt (&lt;5)
                </Typography>
                <Typography variant="h5" fontWeight={600} color="#f44336">
                  {thongKe.soSVCoDiemBeHon5}
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Tỷ lệ: {(100 - parseFloat(tyLeDat)).toFixed(1)}%
                </Typography>
              </Box>

              {thongKe.soSVCoDiemBang10 > 0 && (
                <Box
                  sx={{
                    p: 2,
                    background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                    borderRadius: 2,
                    textAlign: "center",
                  }}
                >
                  <EmojiEventsIcon sx={{ fontSize: 36, color: "white", mb: 1 }} />
                  <Typography variant="h6" fontWeight={600} color="white">
                    {thongKe.soSVCoDiemBang10} sinh viên đạt điểm 10
                  </Typography>
                </Box>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default ThongKeBangDiemContent;
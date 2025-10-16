import React from "react";
import { Box, Stack, Typography, Link, IconButton } from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import FacebookIcon from "@mui/icons-material/Facebook";
import LocationOnIcon from "@mui/icons-material/LocationOn";
const Footer: React.FC = () => {
  return (
    <Box
      sx={{
        backgroundColor: "#334443",
        color: "#fff",
        pt: 5,
        pb: 3,
        px: { xs: 3, md: 10 },
        mt: 8,
      }}
    >
      {/* ==== Phần nội dung chính ==== */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "flex-start" }}
        spacing={6}
      >
        {/* Cột 1: Logo + Giới thiệu */}
        <Box sx={{ flex: 1, alignItems: 'center' }}>

            <img
              src='/assets/image-removebg-preview.png'
              alt="IUH Logo"
              style={{ height: "10vh" }}
            />

          <Typography variant="body1" sx={{ lineHeight: 1}}>
            Hệ thống học tập trực tuyến <b>QuizzCenter</b> được phát triển bởi sinh viên Khoa Công Nghệ Thông Tin – 
            Trường Đại học Công nghiệp TP.HCM.  
            Đây là nền tảng hỗ trợ giảng viên và sinh viên trong việc tổ chức, quản lý và làm bài kiểm tra một cách hiệu quả và hiện đại.
          </Typography>
        </Box>

        {/* Cột 2: Thông tin liên hệ */}
        <Box sx={{ flex: 1, alignItems: 'center' }}>
          <Typography
            variant="h6"
            fontWeight="bold"
            color="orange"
            gutterBottom
          >
            Liên hệ
          </Typography>

          <Stack direction="row" alignItems="flex-start" spacing={1} mb={1}>
            <LocationOnIcon fontSize="small" />
            <Typography variant="body2">
              12 Nguyễn Văn Bảo, Phường 4, Quận Gò Vấp, TP. Hồ Chí Minh
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <PhoneIcon fontSize="small" />
            <Typography variant="body2">0818 819 247</Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <EmailIcon fontSize="small" />
            <Link
              href="mailto:hotaloc9156@gmail.com"
              underline="hover"
              color="inherit"
            >
              hotaloc9156@gmail.com
            </Link>
          </Stack>

          <Typography mt={2} mb={1}>
            Follow us
          </Typography >
          <IconButton
            component="a"
            href="https://www.facebook.com/tanloc.ho.752/"
            target="_blank"
            rel="noopener"
            sx={{
              color: "#fff",
              backgroundColor: "#216D64",
              "&:hover": { backgroundColor: "#1a5c55" },
            }}
          >
            <FacebookIcon />
          </IconButton>
        </Box>

        {/* Cột 3: Thông tin thêm */}
        <Box sx={{ flex: 1, alignItems:'center' }}>
          <Typography
            variant="h6"
            fontWeight="bold"
            color="orange"
            gutterBottom
          >
            Giới thiệu
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
            • Nền tảng hỗ trợ thi trắc nghiệm trực tuyến, dễ sử dụng. <br />
            • Giảng viên có thể tạo đề, chấm điểm và thống kê kết quả. <br />
            • Sinh viên có thể tham gia thi và xem lại lịch sử làm bài. <br />
            • Hệ thống được thiết kế với công nghệ: React, NestJS, PostgreSQL và Supabase. <br />
          </Typography>
        </Box>
      </Stack>

      {/* ==== Phần bản quyền ==== */}
      <Box
        sx={{
          mt: 5,
          borderTop: "1px solid #333",
          textAlign: "center",
          pt: 2,
          color: "#B0CE88",
        }}
      >
        <Typography variant="body2">
          Copyright © 2025 - Phát triển bởi <b>Hồ Tấn Lộc</b>, <b>Cao Minh Trí</b> Sinh viên Khoa CNTT, Trường Đại học Công nghiệp TP.HCM
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;

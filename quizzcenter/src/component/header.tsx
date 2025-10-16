import React from "react";
import { Box, Stack, Typography, IconButton, Avatar } from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";

const Header: React.FC = () => {
  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        width: "100%",            // ✅ không dùng 100vw để tránh tràn
        minHeight: 56,            // hoặc 7vh nếu bạn thích
        bgcolor: "#216D64",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        zIndex: 1200,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        boxSizing: "border-box",  // ✅ padding tính trong chiều rộng
        px: { xs: 2, sm: 3, md: 4 }, // padding ngang responsive
      }}
    >
      {/* Bọc nội dung để căn giữa, tránh đụng mép */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: "100vw",     // tùy ý, bỏ nếu muốn full-bleed
          mx: "auto",
        }}
      >
        {/* Trái: liên hệ */}
        <Stack direction="row" spacing={{ xs: 1.5, md: 3 }} alignItems="center">
          <Stack direction="row" alignItems="center" spacing={1}>
            <PhoneIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2">Call us : 0818819247</Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <EmailIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2">
              E-mail : hotanloc9516@gmail.com
            </Typography>
          </Stack>
        </Stack>

        {/* Phải: thông báo + user */}
        <Stack direction="row" spacing={2} alignItems="center">
          <IconButton size="small" sx={{ color: "#fff" }}>
            <NotificationsNoneIcon />
          </IconButton>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar
              sx={{
                width: 28,
                height: 28,
                bgcolor: "#fff",
                color: "#245D51",
                fontSize: 14,
              }}
            >
              LH
            </Avatar>
            <Typography variant="body2">▼</Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default Header;

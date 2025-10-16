// src/component/navbar.tsx
import { Box, Stack, Link as MuiLink } from "@mui/material";
import { Link, NavLink } from "react-router-dom";

const MenuCollege = () => (
  <Box
    sx={{
      backgroundColor: "#fff",
      px: 10,
      py: 2,
      display: "flex",
      alignItems: "center",
      position: "static",
      justifyContent: "space-between",
      borderBottom: "1px solid #e0e0e0", 
      borderTop: "1px solid #e0e0e0",
    }}
  >
    <Link to="/quizzcenter/my" style={{ display: "inline-block", paddingLeft: '2rem'}}>
      <img
        src='/assets/image-removebg-preview.png'
        alt="IUH Logo"
        style={{ height: "10vh", cursor: "pointer" }}
      />
    </Link>

    <Stack direction="row" alignItems="center" gap={5} spacing={4} padding={2}>
      <MuiLink
        component={NavLink}
        to="/quizzcenter/my"
        underline="none"
        color="inherit"
        sx={{
          "&.active": {
            color: "#216D64",
            fontWeight: 700,
            borderBottom: "3px solid #7CC47C",
            pb: 0.5,
          },
        }}
        end
      >
        Trang chủ
      </MuiLink>

      <MuiLink
        component={NavLink}
        to="/quizzcenter/my/course"
        underline="none"
        color="inherit"
        sx={{
          "&.active": {
            color: "#216D64",
            fontWeight: 700,
            borderBottom: "3px solid #7CC47C",
            pb: 0.5,
          },
        }}
      >
        Các lớp học của tôi
      </MuiLink>
    </Stack>
  </Box>
);

export default MenuCollege;

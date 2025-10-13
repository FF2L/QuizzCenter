// ./overalllayout/mainlayout.tsx
import React, { FC } from "react";
import MenuBar from "../common/menubar";
import { Outlet } from "react-router-dom";
import {
  Box,
  Stack,
  Typography,
  Button,
  Card,
  CardContent,
  Pagination,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
const MainLayout: FC = () => {
  return (
    <Box
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* MenuBar bên trái */}
      <Box style={{ flexShrink: 0 }}>
        <MenuBar />
      </Box>

      {/* Nội dung bên phải */}
      <Box style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
        <Outlet /> {/* Nested routes sẽ render ở đây */}
      </Box>
    </Box>
  );
};

export default MainLayout;

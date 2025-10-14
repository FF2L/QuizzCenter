import ExpandMore from "@mui/icons-material/ExpandMore";
import Home from "@mui/icons-material/Home";
import MenuBook from "@mui/icons-material/MenuBook";
import { useNavigate } from "react-router-dom";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import React, { useState } from "react";

type MenuItem = {
  id: number;
  title: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
};

const menuItems: MenuItem[] = [
  { id: 0, title: "Trang chủ", icon: <Home sx={{ fontSize: 40, fontFamily: "Inter" }} />, path: "/home" },
  { id: 1, title: "Môn học", icon: <MenuBook sx={{ fontSize: 40, fontFamily: "Inter" }} />, path: "/course" },
];

export default function MenuBar() {
  const navigate = useNavigate();
  const [openParent, setOpenParent] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);

  const handleToggle = (id: number) => {
    setOpenParent(openParent === id ? null : id);
  };

  return (
    <Box
      sx={{
        width: "15vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        backgroundColor:"#245D51",
      }}
    >
      {/* Nội dung */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pt: 4,
          height: "100%",
        }}
      >
        {/* Avatar */}
        <img
          src="/assets/teacherAvatar.png"
          alt="icon"
          style={{ width: "120px", height: "120px" }}
        />
        <Typography
          sx={{
            mt: 3,
            fontWeight: 500,
            fontSize: "28px",
            lineHeight: "20px",
            fontFamily: "Inter",
            color:"white"
          }}
        >
          Giảng Viên
        </Typography>

        {/* Menu Items */}
        <Box
          sx={{
            mt: 5,
            width: "100%",
            flex: 1,
            overflowY: "auto",
          }}
        >
          <List disablePadding>
  {menuItems.map((item, index) => (
    <React.Fragment key={item.id}>
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          backgroundColor:"#245D51"
        }}
      >
        <ListItem
          onClick={() => {
            setSelected(item.id);
            item.children
              ? handleToggle(item.id)
              : item.path && navigate(item.path);
          }}
          sx={{
            height: "50px",
            cursor: "pointer",
            backgroundColor:
              selected === item.id ? "#FFFFFF" : "transparent", // ✅ Nền khi chọn
            "&:hover": {
              backgroundColor:
                selected === item.id ? "#1E4E44" : "rgba(0,0,0,0.04)",
            },
            transition: "all 0.3s ease",
     
            
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 60,
              color: selected === item.id ? "#000000" : "#FFFFFF", // ✅ Icon trắng khi chọn
            }}
          >
            {item.icon}
          </ListItemIcon>

          <ListItemText
            primary={item.title}
            primaryTypographyProps={{
              fontWeight: 500,
              color: selected === item.id ? "#000000" : "#FFFFFF", // ✅ Chữ trắng khi chọn
              fontSize: 18,
              letterSpacing: "-0.40px",
              lineHeight: "20px",
            }}
          />

          {item.children && (
            <ExpandMore
              sx={{
                color: selected === item.id ? "#FFFFFF" : "#000000",
                fontSize: 24,
                transform:
                  openParent === item.id ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
              }}
            />
          )}
        </ListItem>
      </Paper>
    </React.Fragment>
  ))}
</List>

        </Box>
      </Box>
    </Box>
  );
}

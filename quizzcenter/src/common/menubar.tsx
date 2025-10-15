import React, { useState, useEffect } from "react";
import { Box, List, ListItem, ListItemIcon, ListItemText, Paper, Typography } from "@mui/material";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Home from "@mui/icons-material/Home";
import MenuBook from "@mui/icons-material/MenuBook";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { useUser } from "../page/system/auth/userContext";
import axios from "axios";

type MenuItemType = {
  id: number;
  title: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItemType[];
};

export default function MenuBar() {
  const navigate = useNavigate();
  const { role, name, setRole, setName } = useUser();
  const [openParent, setOpenParent] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);

  const handleToggle = (id: number) => setOpenParent(openParent === id ? null : id);

  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) throw new Error("Không tìm thấy accessToken");
  
      const res = await axios.post(
        "http://localhost:3000/auth/logout",
        {}, // body có thể để trống
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
  
      console.log("Logout response:", res.data);
    } catch (err: any) {
      console.error("Lỗi khi logout:", err);
      alert("Đăng xuất thất bại hoặc token hết hạn");
    } finally {
      // Luôn xóa localStorage để client logout
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("role");
      localStorage.removeItem("name");
      setRole("");
      setName("");
      navigate("/login");
    }
  };
  
  

  useEffect(() => {
    if (!role) return;

    if (role === "GiaoVien") {
      setMenuItems([
        { id: 0, title: "Trang chủ", icon: <Home />, path: "/" },
        { id: 1, title: "Môn học", icon: <MenuBook />, path: "/course" },
      ]);
    } else {
      setMenuItems([
        { id: 0, title: "Trang chủ", icon: <Home />, path: "/" },
        { id: 1, title: "Lớp học phần", icon: <MenuBook />, path: "/" },
      ]);
    }
  }, [role]);

  return (
    <Box sx={{ width: "15vw", height: "100vh", backgroundColor: "#245D51", display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: 4 }}>
        <img src="/assets/teacherAvatar.png" alt="icon" style={{ width: "120px", height: "120px" }} />
        <Typography sx={{ mt: 3, fontWeight: 500, fontSize: "23px", color: "white" }}>
          {name || (role === "GiaoVien" ? "Giảng Viên" : "Sinh Viên")}
        </Typography>
      </Box>

      <Box sx={{ mt: 5, flex: 1, width: "100%", overflowY: "auto" }}>
        <List disablePadding>
          {menuItems.map((item) => (
            <React.Fragment key={item.id}>
              <Paper elevation={0} sx={{ width: "100%", backgroundColor: "#245D51" }}>
                <ListItem
                  onClick={() => {
                    setSelected(item.id);
                    item.children ? handleToggle(item.id) : item.path && navigate(item.path);
                  }}
                  sx={{
                    height: "50px",
                    cursor: "pointer",
                    backgroundColor: selected === item.id ? "#FFFFFF" : "transparent",
                    "&:hover": { backgroundColor: selected === item.id ? "#1E4E44" : "rgba(0,0,0,0.04)" },
                    transition: "all 0.3s ease",
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 60, color: selected === item.id ? "#000000" : "#FFFFFF" }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    primaryTypographyProps={{
                      fontWeight: 500,
                      color: selected === item.id ? "#000000" : "#FFFFFF",
                      fontSize: 18,
                    }}
                  />
                  {item.children && (
                    <ExpandMore
                      sx={{
                        color: selected === item.id ? "#FFFFFF" : "#000000",
                        fontSize: 24,
                        transform: openParent === item.id ? "rotate(180deg)" : "rotate(0deg)",
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

      {/* Logout button cố định dưới cùng */}
      <Box sx={{ mb: 2 }}>
        <Paper elevation={0} sx={{ width: "100%", backgroundColor: "#245D51" }}>
          <ListItem
            onClick={handleLogout}
            sx={{
              height: "50px",
              cursor: "pointer",
              "&:hover": { backgroundColor: "rgba(0,0,0,0.1)" },
              transition: "all 0.3s ease",
            }}
          >
            <ListItemIcon sx={{ minWidth: 60, color: "#FFFFFF" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Đăng xuất"
              primaryTypographyProps={{ fontWeight: 500, color: "#FFFFFF", fontSize: 18 }}
            />
          </ListItem>
        </Paper>
      </Box>
    </Box>
  );
}

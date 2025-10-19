import React, { useState, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  ExpandMore,
  ChevronLeft,
  ChevronRight,
  Home,
  MenuBook,
  Logout,
} from "@mui/icons-material";
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
  const { role, name, anhDaiDien, setRole, setName } = useUser();
  const [openParent, setOpenParent] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  const handleToggle = (id: number) => setOpenParent(openParent === id ? null : id);

  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) throw new Error("Không tìm thấy accessToken");

      await axios.post(
        "http://localhost:3000/auth/logout",
        {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    } catch (err: any) {
      console.error("Lỗi logout:", err);
    } finally {
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
        { id: 0, title: "Trang chủ", icon: <Home />, path: "/home" },
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
    <Box
      sx={{
        width: collapsed ? 80 : 220,
        height: "100vh",
        background: "linear-gradient(180deg,#245D51,#1B3D36)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s",
        boxShadow: "2px 0 12px rgba(0,0,0,0.2)",
      }}
    >
      {/* Avatar */}
      <Box
        sx={{
          display: "flex",
          flexDirection: collapsed ? "row" : "column",
          alignItems: "center",
          pt: 4,
          pb: 3,
          px: 2,
          justifyContent: collapsed ? "center" : "flex-start",
          gap: collapsed ? 1 : 0,
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            overflow: "hidden",
            border: "3px solid #00ffc8",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            "&:hover": { transform: "scale(1.05)" },
            transition: "transform 0.3s",
          }}
        >
          <img
            src={anhDaiDien || "/assets/teacherAvatar.png"}
            alt="avatar"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </Box>
        {!collapsed && (
          <Typography
            sx={{ mt: 2, fontWeight: 600, fontSize: 18, color: "#fff" }}
          >
            {name || (role === "GiaoVien" ? "Giảng Viên" : "Sinh Viên")}
          </Typography>
        )}
      </Box>

      {/* Toggle collapse */}
      <Box sx={{ display: "flex", justifyContent: collapsed ? "center" : "flex-end", px: 1 }}>
        <IconButton
          onClick={() => setCollapsed(!collapsed)}
          sx={{ color: "#fff", mb: 1 }}
          size="small"
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>

      {/* Menu items */}
      <Box sx={{ flex: 1, overflowY: "auto", px: collapsed ? 0 : 1 }}>
        <List disablePadding>
          {menuItems.map((item) => (
            <React.Fragment key={item.id}>
              <Paper elevation={0} sx={{ width: "100%", backgroundColor: "transparent" }}>
                <ListItem
                  onClick={() => {
                    setSelected(item.id);
                    item.children ? handleToggle(item.id) : item.path && navigate(item.path);
                  }}
                  sx={{
                    height: 50,
                    cursor: "pointer",
                    borderRadius: 8,
                    px: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: collapsed ? "center" : "flex-start",
                    backgroundColor:
                      selected === item.id ? "rgba(0,255,200,0.15)" : "transparent",
                    borderLeft:
                      selected === item.id ? "4px solid #00ffc8" : "4px solid transparent",
                    "&:hover": {
                      background:
                        "linear-gradient(90deg, rgba(0,255,200,0.1), rgba(0,255,200,0.05))",
                      "& .MuiListItemIcon-root": { color: "#00ffc8" },
                      "& .MuiListItemText-root": { color: "#00ffc8" },
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 70, // tăng khoảng cách icon → text
                      color: selected === item.id ? "#00ffc8" : "#fff",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.title}
                      sx={{ ml: 1 }}
                      primaryTypographyProps={{
                        fontWeight: selected === item.id ? 600 : 500,
                        color: selected === item.id ? "#00ffc8" : "#fff",
                        fontSize: 16,
                      }}
                    />
                  )}
                  {item.children && !collapsed && (
                    <ExpandMore
                      sx={{
                        color: "#fff",
                        fontSize: 20,
                        transform: openParent === item.id ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.3s",
                      }}
                    />
                  )}
                </ListItem>

                {item.children && !collapsed && (
                  <Collapse in={openParent === item.id} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding sx={{ pl: 4 }}>
                      {item.children.map((sub) => (
                        <ListItem
                          key={sub.id}
                          onClick={() => sub.path && navigate(sub.path)}
                          sx={{
                            height: 40,
                            cursor: "pointer",
                            borderRadius: 6,
                            px: 2,
                            "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 30, color: "#fff" }}>
                            {sub.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={sub.title}
                            primaryTypographyProps={{ color: "#fff", fontSize: 14 }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                )}
              </Paper>
            </React.Fragment>
          ))}
        </List>
      </Box>

      {/* Logout button */}
      <Box sx={{ mb: 2, px: collapsed ? 0 : 1 }}>
        <Paper elevation={0} sx={{ width: "100%", backgroundColor: "transparent" }}>
          <ListItem
            onClick={handleLogout}
            sx={{
              height: 50,
              cursor: "pointer",
              borderRadius: 8,
              display: "flex",
              justifyContent: collapsed ? "center" : "flex-start",
              alignItems: "center",
              "&:hover": { background: "linear-gradient(90deg,#ff4d4d,#ff9999)" },
              transition: "all 0.3s",
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: "#fff" }}>
              <Logout />
            </ListItemIcon>
            {!collapsed && (
              <ListItemText
                primary="Đăng xuất"
                primaryTypographyProps={{ fontWeight: 600, color: "#fff", fontSize: 16 }}
              />
            )}
          </ListItem>
        </Paper>
      </Box>
    </Box>
  );
}

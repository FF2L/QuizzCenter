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
  Class,
  Person,
  Book,
  GroupAdd,
  Group,
  MeetingRoom
  
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { LoginService } from "../services/login.api";
import { UserService } from "../services/user.api";

type MenuItemType = {
  id: number;
  title: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItemType[];
};

export default function MenuBar({ role }: { role: string }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [openParent, setOpenParent] = useState<number | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [vaiTro, setVaiTro] = useState('');

  const handleToggle = (id: number) => setOpenParent(openParent === id ? null : id);

  // Xác định item được chọn dựa vào URL hiện tại
  const getSelectedItem = () => {
    const path = location.pathname;
    if (role === "GiaoVien") {
      if (path.includes('/lecturer/home')) return 0;
      if (path.includes('/lecturer/user')) return 1;
      if (path.includes('/lecturer/course') || path.includes('/lecturer/page/')) return 2;
      if (path.includes('/lecturer/class')) return 3;
    } else if (role === "SinhVien") {
      if (path.includes('/quizzcenter/my/course')) return 2;
      if ( path.includes('/quizzcenter/my/userProfile')) return 1;
      if ( path.includes('/quizzcenter/my')) return 0;
    } else if (role === "Admin") {
      if (path.includes('/admin/qlnd')) return 2;
      if (path.includes('/admin/pllh')) return 3;
      if (path.includes('/admin/plmh')) return 4;
      if (path.includes('/admin/pcmh')) return 5;
    }
    
    return null;
  };
  useEffect(() => {
    async function fetchUser() {
      setVaiTro(checkRole());
      const res = await UserService.getUserInfo();

  
      if (res.ok && res.data) {
        setUserName(res.data.hoTen);
        setAvatar(res.data.anhDaiDien);
      }
    }
  
    fetchUser();
  }, []);

  const checkRole = () => {
   const currentPath = window.location.pathname;
  
    if (currentPath.includes('/lecturer/')) {
      return "Giảng viên";
    } else if (currentPath.includes('/quizzcenter/')) {
      return "Sinh viên";
    } else if (currentPath.includes('/admin/')) {
      return "Admin";
    }

    return '';
  }
  
  const handleLogout = async () => {
    let accessToken = ''
    if(role === 'GiaoVien'){
      accessToken = localStorage.getItem("accessTokenGV") || ''
      localStorage.removeItem("accessTokenGV");
      localStorage.removeItem("refreshTokenV");
    }else if(role === 'SinhVien'){
      accessToken = localStorage.getItem("accessTokenSV") || ''
      localStorage.removeItem("accessTokenSV");
      localStorage.removeItem("refreshTokenSV");
    }else if(role === 'Admin'){
      accessToken = localStorage.getItem("accessTokenAD") || ''
      localStorage.removeItem("accessTokenAD");
      localStorage.removeItem("refreshTokenAD");
    }
    const res = await LoginService.logout();
    navigate("/login");
  };

  useEffect(() => {
    if (role === "GiaoVien") {
      setMenuItems([
        { id: 0, title: "Trang chủ", icon: <Home />, path: "/lecturer/home" },
        { id: 1, title: "Người dùng", icon: <Person />, path: "/lecturer/user" },
        { id: 2, title: "Môn học", icon: <MenuBook />, path: "/lecturer/course" },
        { id: 3, title: "Lớp học", icon: <Class />, path: "/lecturer/class" },
      ]);
    } else if( role === "SinhVien") {
      setMenuItems([
        { id: 0, title: "Trang chủ", icon: <Home />, path: "/quizzcenter/my" },
        { id: 1, title: "Người dùng", icon: <Person />, path: "/quizzcenter/my/userProfile" },
        { id: 2, title: "Lớp học", icon: <MenuBook />, path: "/quizzcenter/my/course" },
      ]);
    } else if( role === "Admin") {
      setMenuItems([
        // { id: 0, title: "Trang chủ", icon: <Home />, path: "/admin/home" },
        // { id: 1, title: "Người dùng", icon: <Person />, path: "/admin/user" },
        { id: 2, title: "Quản lý người dùng", icon: <Group />, path: "/admin/qlnd" },
        { id: 3, title: "Quản lý lớp học", icon: <MeetingRoom />, path: "/admin/pllh" },
        { id: 4, title: "Quản lý môn học", icon: <Book />, path: "/admin/plmh" },
        { id: 5, title: "Phân công môn học", icon: <GroupAdd />, path: "/admin/pcmh" },
      ]);
    }
  }, [role]);

  const selectedItem = getSelectedItem();

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
          {!collapsed && (
          <Typography
            sx={{ mt: 2, fontWeight: 600, fontSize: 18, color: "#fff" ,pb:3 }}
          >
           {vaiTro}
          </Typography>
        )}
          {!collapsed && (
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
            src={avatar || "/assets/defaultAvatar.png"}
            alt="avatar"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}/>
        </Box>
        )}
        {!collapsed && (
          <Typography
            sx={{ mt: 2, fontWeight: 600, fontSize: 18, color: "#fff" }}
          >
           {userName || "Đang tải..."}


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
                    if (item.children) {
                      handleToggle(item.id);
                    } else if (item.path) {
                      navigate(item.path);
                    }
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
                      selectedItem === item.id ? "rgba(0,255,200,0.15)" : "transparent",
                    borderLeft:
                      selectedItem === item.id ? "4px solid #00ffc8" : "4px solid transparent",
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
                      minWidth: 70,
                      color: selectedItem === item.id ? "#00ffc8" : "#fff",
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
                        fontWeight: selectedItem === item.id ? 600 : 500,
                        color: selectedItem === item.id ? "#00ffc8" : "#fff",
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
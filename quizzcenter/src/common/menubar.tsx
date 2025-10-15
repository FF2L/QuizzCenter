import React, { useState, useEffect } from "react";
import { Box, List, ListItem, ListItemIcon, ListItemText, Paper, Typography } from "@mui/material";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Home from "@mui/icons-material/Home";
import MenuBook from "@mui/icons-material/MenuBook";
import { useNavigate } from "react-router-dom";
import { useUser } from "../page/system/auth/userContext";

type MenuItemType = {
  id: number;
  title: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItemType[];
};

export default function MenuBar() {
  const navigate = useNavigate();
  const { role,name } = useUser();
  const [openParent, setOpenParent] = useState<number | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);

  const handleToggle = (id: number) => setOpenParent(openParent === id ? null : id);

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
    <Box sx={{ width: "15vw", height: "100vh", backgroundColor: "#245D51" }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: 4, height: "100%" }}>
        <img src="/assets/teacherAvatar.png" alt="icon" style={{ width: "120px", height: "120px" }} />
        <Typography sx={{ mt: 3, fontWeight: 500, fontSize: "23px", color: "white" }}>
        {name}
        </Typography>

        <Box sx={{ mt: 20, width: "100%", flex: 1, overflowY: "auto" }}>
          <List disablePadding>
            {menuItems.map(item => (
              <React.Fragment key={item.id}>
                <Paper elevation={0} sx={{ width: "100%", backgroundColor: "#245D51" }}>
                  <ListItem
                    onClick={() => { setSelected(item.id); item.children ? handleToggle(item.id) : item.path && navigate(item.path); }}
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
                    <ListItemText primary={item.title} primaryTypographyProps={{
                      fontWeight: 500,
                      color: selected === item.id ? "#000000" : "#FFFFFF",
                      fontSize: 18,
                    }} />
                    {item.children && <ExpandMore sx={{
                      color: selected === item.id ? "#FFFFFF" : "#000000",
                      fontSize: 24,
                      transform: openParent === item.id ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s",
                    }} />}
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

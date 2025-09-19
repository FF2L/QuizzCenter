import ExpandMore from "@mui/icons-material/ExpandMore";
import Home from "@mui/icons-material/Home";
import ManageAccounts from "@mui/icons-material/ManageAccounts";
import Course from "../page/system/course/course";
import { useNavigate } from "react-router-dom";
import LibraryBooks from "@mui/icons-material/LibraryBooks";
import MenuBook from "@mui/icons-material/MenuBook";
import {
  Avatar,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
  Collapse,
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
  { id: 0, title: "Home", icon: <Home sx={{ fontSize: 40, color: "#000" }} />, path: "/home" },
  { id: 1, title: "Môn học", icon: <MenuBook sx={{ fontSize: 40, color: "#000" }}/>, path: "/course" },
];

export default function MenuBar() {
  const navigate = useNavigate();
  const [openParent, setOpenParent] = useState<number | null>(null);

  const handleToggle = (id: number) => {
    setOpenParent(openParent === id ? null : id);
  };

  return (
    <Box
      sx={{
        width: "250px",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Gradient background */}
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          background: "#245d51",
          zIndex: 0,
        }}
      />

      {/* Nội dung overlay */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pt: 4,
          height: "100%",
        }}
      >
        {/* Avatar */}
    
        <img src="/assets/teacherAvatar.png" alt="icon" style={{ width: "120px", height: "120px" }} />
        <Typography sx={{ mt: 3, fontWeight: 500, color: "white", fontSize: "28px", lineHeight: "20px" }}>
          Giảng Viên
        </Typography>
        <Typography sx={{ mt: 2,  fontWeight: 400, color: "white", fontSize: 16 }}>
          Features
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
                    borderRadius: 0,
                    borderTop: index === 0 ? "1px solid #a1b4ab" : "none",
                    borderBottom: "1px solid #a1b4ab",
                    backgroundColor: "white",
                  }}
                >
                  <ListItem
                    onClick={() =>
                      item.children ? handleToggle(item.id) : item.path && navigate(item.path)
                    }
                    sx={{
                      height: "50px",
                      cursor: "pointer",
                      "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 60 }}>{item.icon}</ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      primaryTypographyProps={{
      
                        fontWeight: 500,
                        color: "#000000",
                        fontSize: 18,
                        letterSpacing: "-0.40px",
                        lineHeight: "20px",
                      }}
                    />
                    {item.children && (
                      <ExpandMore
                        sx={{
                          color: "#000",
                          fontSize: 24,
                          transform: openParent === item.id ? "rotate(180deg)" : "rotate(0deg)",
                          transition: "transform 0.2s",
                        }}
                      />
                    )}
                  </ListItem>
                </Paper>

                {/* Submenu */}
                {item.children && (
                  <Collapse in={openParent === item.id} timeout="auto" unmountOnExit>
                    {item.children.map((child) => (
                      <Paper
                        key={child.id}
                        elevation={0}
                        sx={{
                          width: "100%",
                          borderRadius: 0,
                          borderBottom: "1px solid #a1b4ab",
                          backgroundColor: "#f7f9fc",
                          pl: 6, // lùi vào để nhìn như menu con
                        }}
                      >
                        <ListItem
                          onClick={() => child.path && navigate(child.path)}
                          sx={{
                            height: 56,
                            cursor: "pointer",
                            "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 50 }}>{child.icon}</ListItemIcon>
                          <ListItemText
                            primary={child.title}
                            primaryTypographyProps={{
                              fontFamily: "Poppins",
                              fontWeight: 400,
                              color: "#000000",
                              fontSize: 16,
                            }}
                          />
                        </ListItem>
                      </Paper>
                    ))}
                  </Collapse>
                )}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Box>
    </Box>
  );
}

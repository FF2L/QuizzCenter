// ./overalllayout/mainlayout.tsx
import  { FC } from "react";
import MenuBar from "../../common/menubar";
import { Outlet } from "react-router-dom";
import {Box,} from "@mui/material";
const AdminQuizzCenter: FC = () => {
  const role= "Admin"
  console.log("Role in MainLayout:", role);
  return (
    <Box
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#c0c0c0ff", 
      }}
    >
      {/* MenuBar bên trái */}
      <Box style={{ flexShrink: 0 }}>
        <MenuBar role={role} />
      </Box>

      {/* Nội dung bên phải */}
      <Box
        sx={{
          flex: 1,              
          p: 2,                
          display: "flex",
          alignItems: "flex-start", // canh theo trục dọc,
          pt: 20,
          justifyContent: "center", 

          overflowY: "auto",     // ✅ cho cuộn dọc
          overflowX: "hidden",   // ✅ không cho cuộn ngang
          maxHeight: "100vh",    // ✅ tránh tràn khỏi màn hình
        }}
      >
         <Outlet />
      </Box>
    </Box>
  );
};

export default AdminQuizzCenter;

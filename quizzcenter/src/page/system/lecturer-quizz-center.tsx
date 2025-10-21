// ./overalllayout/mainlayout.tsx
import  { FC } from "react";
import MenuBar from "../../common/menubar";
import { Outlet } from "react-router-dom";
import {Box,} from "@mui/material";
const LecturerQuizzCenter: FC = () => {
  const role= "GiaoVien"
  console.log("Role in MainLayout:", role);
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
        <MenuBar role={role} />
      </Box>

      {/* Nội dung bên phải */}
      <Box style={{ flex: 1, padding: "20px", overflowY: "auto" }}>
         <Outlet />
      </Box>
    </Box>
  );
};

export default LecturerQuizzCenter;

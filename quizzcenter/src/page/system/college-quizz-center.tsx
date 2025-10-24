// import React, { useEffect } from "react";
// import { Box } from "@mui/material";
// import { Outlet } from "react-router-dom";
// import Header from "../../component/header";
// import MenuCollege from "../../component/college/menu";
// import Footer from "../../component/footer";

// const QuizzCenter: React.FC = () =>{

//     return(
//         <Box 
//             sx={{
//             minHeight: "100vh",          // full chiều cao màn hình
//             display: "flex",
//             flexDirection: "column",
//             }}>

//              <Header />

//              <MenuCollege />

//             <Box sx={{ flex: 1, backgroundColor: "#fff" }}>
//                 <Outlet />
//             </Box>

//              <Footer />
//         </Box>
       

//     )
// } 

// export default QuizzCenter;

// ./overalllayout/mainlayout.tsx
import  { FC } from "react";
import MenuBar from "../../common/menubar";
import { Outlet } from "react-router-dom";
import {Box,} from "@mui/material";
const CollegeQuizzCenter: FC = () => {
  const role= "SinhVien"
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

export default CollegeQuizzCenter;

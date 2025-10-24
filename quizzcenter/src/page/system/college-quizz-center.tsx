import React, { useEffect } from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Header from "../../component/header";
import MenuCollege from "../../component/college/menu";
import Footer from "../../component/footer";

const QuizzCenter: React.FC = () =>{

    return(
        <Box 
            sx={{
            minHeight: "100vh",          // full chiều cao màn hình
            display: "flex",
            flexDirection: "column",
            }}>

             <Header />

             <MenuCollege />

            <Box sx={{ flex: 1, backgroundColor: "#fff" }}>
                <Outlet />
            </Box>

             <Footer />
        </Box>
       

    )
} 

export default QuizzCenter;
import { Box } from "@mui/material";
import axios from "axios";
import React, { useEffect } from "react";

const CollegeDashBoard: React.FC = () =>{
    const token = localStorage.getItem("accessToken")

    useEffect(() =>{
        const danhSanhLopHocPhan = async () =>{
            try{
                const res = await axios.get('http://localhost:3000/v2/lop-hoc-phan', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                console.log(token)
                console.log(res.data)
            }catch(error){

            }
        }
        danhSanhLopHocPhan()
    },[])
    return(
        <Box sx={{ flex: 1, pt: "40px" }}>
            Đây là trang chủ
        </Box>

    )
} 

export default CollegeDashBoard;
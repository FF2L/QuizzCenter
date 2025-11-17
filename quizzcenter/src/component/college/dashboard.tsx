import { Box ,Typography} from "@mui/material";
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
        <Box
        sx={{
          width: "100%",
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: 4,
        }}
      >
        {/* Banner Image */}
        <Box
          component="img"
          src="/assets/iuh.jpg"
          alt="IUH Banner"
          sx={{
            width: "90%",
            maxWidth: "1200px",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            objectFit: "cover",
          }}
        />
  
        {/* Optional title */}
        <Typography
          variant="h4"
          sx={{
            marginTop: 3,
            fontWeight: 700,
            color: "#333",
            textAlign: "center",
          }}
        >
          Nhóm 127
        </Typography>
  
        <Typography
          variant="subtitle1"
          sx={{ color: "#666", marginTop: 1, textAlign: "center" }}
        >
        </Typography>
      </Box>

    )
} 

export default CollegeDashBoard;
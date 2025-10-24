import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Box,
  Tab,
  Tabs,
  Typography,
  IconButton,
  Stack,
  Breadcrumbs,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Category from "./component/categoryTab";

import { useLocation } from "react-router-dom";
import BankQuestion from "../bankquestion/bankquestion";

function PageClassChapterBankQuestion() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState(0);
  const { tenMonHoc } = location.state || {};
  

  useEffect(() => {
    if (location.state?.tab !== undefined) {
      console.log("Setting selectedTab from location.state:", location.state.tab);
      setSelectedTab(location.state.tab);
    }
  }, [location.state]);

  const handleTabChange = (event: React.SyntheticEvent, newValue:number)=>{
    setSelectedTab(newValue)
  }
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#F8F9FA",
      
        p: 2,
      }}
    >
      <Stack spacing={3} sx={{ maxWidth: 1582, mx: "auto" }}>
        {/* Header: Search + Back */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
        
         <Stack spacing={0}>
          <Box  sx={{ position: 'relative', top: -10,}}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
          
            sx={{ "& .MuiTabs-indicator": { display: "none" }, }}
          >
<Tab
  label={
    <Typography
      sx={{
        color: selectedTab === 0 ? "white" : "black",
        fontWeight:500,
        fontSize: "20px",
        textTransform: "none",
      }}
    >
      Danh mục
    </Typography>
  }
  sx={{
    backgroundColor: selectedTab === 0 ? "#245d51" : "#FFFFFF",
    minHeight: "40px",
    minWidth: "180px",
    mr: 0.5,
    border: "1px solid #C5C5C5",
    borderRadius:"5px"
  }}
/>
<Tab
  label={
    <Typography
      sx={{
        color: selectedTab === 1 ? "white" : "black",
        textTransform: "none",
      }}
    >
      Ngân hàng câu hỏi
    </Typography>
  }
  sx={{
    backgroundColor: selectedTab === 1 ? "#245D51" : "#FFFFFF",
    minHeight: "40px",
    minWidth: "180px",
    border: "1px solid #C5C5C5",
    borderRadius:"5px"
  }}
/>
          </Tabs>
        </Box>
        </Stack>
 {/* Right: Back button */}
 <IconButton
            onClick={() => navigate(-1)}
            sx={{
              color: "black",
              borderRadius: "12px",
              width: 60,
              height: 60,
              ml: 2,
              "&:hover": { backgroundColor: "#1e4d42",color:"white" },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Stack>

    
      

        {/* Course List */}
    
      </Stack>
        <Breadcrumbs
          aria-label="breadcrumb"
          separator="›"
          sx={{
            color: "#555",
            "& .MuiTypography-root": { fontSize: 15 },
          }}
        >
          <Typography sx={{ color: "#666" }}>
            Môn học: 
            <span style={{ fontWeight: 600, color: "#000" }}> {tenMonHoc}</span>
          </Typography>

          <Typography sx={{ color: "#e91e63", fontWeight: 600 }}>
           {selectedTab === 1 ? "Ngân hàng câu hỏi" : "Danh mục"} 
          </Typography>
        </Breadcrumbs>

      {selectedTab ===0 && <Category/> }
      {selectedTab ===1 && <BankQuestion/> }
    </Box>
  );
}

export default PageClassChapterBankQuestion;

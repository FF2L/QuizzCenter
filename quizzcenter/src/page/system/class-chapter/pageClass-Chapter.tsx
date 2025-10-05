import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Category from "./component/categoryTab";
import Class from "../class/class"
import BankQuestion from "../bankquestion/bankquestion";
import { useLocation } from "react-router-dom";
function PageClassChapterBankQuestion() {
  const [selectedChuongFromCategory, setSelectedChuongFromCategory] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    if (location.state?.tab !== undefined) {
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
        color: selectedTab === 0 ? "white" : "black", // ✔ chọn = trắng
        textTransform: "none",
      }}
    >
      Lớp học
    </Typography>
  }
  sx={{
    backgroundColor: selectedTab === 0 ? "#245d51" : "#FFFFFF", // ✔ chọn = xanh
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
        fontWeight:500,
        fontSize: "20px",
        textTransform: "none",
      }}
    >
      Danh mục
    </Typography>
  }
  sx={{
    backgroundColor: selectedTab === 1 ? "#245d51" : "#FFFFFF",
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
        color: selectedTab === 2 ? "white" : "black",
        textTransform: "none",
      }}
    >
      Ngân hàng câu hỏi
    </Typography>
  }
  sx={{
    backgroundColor: selectedTab === 2 ? "#245D51" : "#FFFFFF",
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

      {selectedTab ===0 && <Class/> }
      {selectedTab ===1 && <Category/> }
      {selectedTab ===2 && <BankQuestion/> }
    </Box>
  );
}

export default PageClassChapterBankQuestion;

import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { CardMedia } from "@mui/material";
import { useEffect } from "react";
import { MonHoc } from "../../../common/model";
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
} from "@mui/material";
import React, { useState } from "react";



 function Course() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [monHoc,setMonHoc] =useState<MonHoc[]> ([])
  const [loading,setLoading] = useState (false)
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMonHoc = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:3000/mon-hoc", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data: MonHoc[] = await res.json();
        setMonHoc(data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMonHoc();
  }, []);

  if (loading) return <p>Đang tải dữ liệu...</p>;

//   const handleTabChange = (event, newValue) => {
//     setSelectedTab(newValue);
//   };

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "white",
        borderRadius: "10px",
        p: 2,
      }}
    >
      <Stack spacing={3} sx={{ maxWidth: 1582, mx: "auto" }}>
        {/* Header with Search */}
       

        {/* Navigation Tabs */}
        <Tabs
          value={selectedTab}
        //   onChange={handleTabChange}
          sx={{
            "& .MuiTabs-indicator": {
              display: "none",
            },
          }}
        >
           <Tab
    label={
      <Typography
        sx={{
          color: selectedTab === 0 ? "white" : "black", // đổi màu theo tab được chọn
          fontFamily: "Poppins, Helvetica",
          fontWeight: 500,
          fontSize: "20px",
          textTransform: "none",
        }}
      >
        Môn học của tôi
      </Typography>
    }
    sx={{
      backgroundColor: selectedTab === 0 ? "#245d51" : "#e7e7e7",
      minHeight: 56,
      minWidth: 200,
      mr: 2,
      "&:hover": {
        backgroundColor: selectedTab === 0 ? "#245d51" : "#d0d0d0",
      },
    }}
  />

        </Tabs>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ pt: 4 }}>
          <Autocomplete
            options={[]}
            sx={{
             
              width: "350px",
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#e7e7e7",
                           //style của Searchtextfield     
                height: "45px",
                border: "none",
                "& fieldset": {
                  border: "none",
                },
              },
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Search..."
                sx={{
                  "& .MuiInputBase-input": {
                    fontFamily: "Product Sans, Helvetica",
                    fontWeight: "bold",
                    fontSize: "20px",
                    color: "#959595",
                  },
                }}
              />
            )}
          />
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            sx={{
              backgroundColor: "#245d51",
            
              height: "45px",
              width: "130px",
              fontFamily: "Poppins, Helvetica",
              fontWeight: "medium",
              fontSize: "16px",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#1e4d42",
              },
            }}
          >
            Tìm kiếm
          </Button>
        </Stack>
        {/* Course List */}
        <Box
          sx={{
            borderRadius: "10px",
            p: 4,
          }}
        >
                  <Typography sx={{fontSize:20}}>Môn học</Typography>

          <Stack spacing={3}>
            {monHoc.map((course) => (
              <Card
                key={course.id}
                
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" spacing={3} alignItems="center">
                  <img src="/assets/Book1.jpg" style={{height:"100px", width:"200px", borderRadius:"10px"}} ></img>
                     <Box sx={{ flex: 1 }}>
    <Typography
       onClick={() =>navigate(`/page/${course.id}`, { state: { tenMonHoc: course.tenMonHoc } })
      } 
    >
      {course.tenMonHoc}
    </Typography>
  </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
 export default Course
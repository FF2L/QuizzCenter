import AddIcon from "@mui/icons-material/Add";
import { useParams,useLocation } from "react-router-dom";
import CategoryIcon from "@mui/icons-material/Category";
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useState, use } from "react";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  Menu, MenuItem 
} from "@mui/material";

const Class = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);  //menu con
  const open = Boolean(anchorEl);

  const { idMonHoc } = useParams<{ idMonHoc: string }>();

  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { tenMonHoc } = location.state || {};

  //mở create-dialog
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);

 


  const handleCloseDialog = () =>{
    setOpenCreateDialog(false);
    setOpenUpdateDialog(false);
  }
  const idMonHocNumber = Number(idMonHoc); 


  
  const handleClose = () => {
    setAnchorEl(null);
  };



  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#F2F2F2",
        borderRadius: "10px",
        padding: 0,
      }}
    >
      <Stack spacing={3}>
        {/* Search */}
        <Stack direction="row" spacing={-1} alignItems="center" justifyContent="center">
          <Box sx={{ mt: "20px", display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Autocomplete
              options={[]}
              sx={{
                mt: "50px", 
                width: "350px",
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  
                  height: "45px",
                  "& fieldset": { border: "none" },
                },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Tìm kiếm danh mục ..."
                  sx={{
                    "& .MuiInputBase-input": {
                      color: "#959595",
                      fontSize: "16px",
                      fontWeight: "medium",
                      fontFamily: "Poppins",
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
               
                mt: "50px", 
                height: "45px",
                width: "130px",
                fontSize: "16px",
                fontWeight: "medium",
                boxShadow:'none',
                textTransform: "none",
                "&:hover": { backgroundColor: "#1a4a3e" },
              }}
            >
              Tìm kiếm
            </Button>
          </Box>
        </Stack>

        {/* Header */}
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ width: "50px", height: "50px", backgroundColor: "#245d51", borderRadius: "32px" }}>
              <CategoryIcon sx={{ fontSize: 40, color: "white" }} />
            </Box>
            <Typography variant="h3" sx={{  fontWeight: "medium", fontSize: "30px", color: "black" }}>
              Lớp học của tôi
            </Typography>
          </Stack>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
        
            sx={{
              backgroundColor: "#408c55",
              borderRadius: "10px",
              height: "50px",
              width: "120px",
              fontSize: "16px",
              fontWeight: "bold",
              textTransform: "none",
              boxShadow: "inset 0px 6px 17px rgba(36, 93, 81, 0.25)",
              "&:hover": { backgroundColor: "#357045" },
            }}
          >
            Tạo
          </Button>
        </Stack>

        {/* Category List */}
        <Stack spacing={2}>
          <Box sx={{ flexDirection: "row", display: "flex", alignItems: "center" }}>
        
          </Box>
            <Card  sx={{ borderRadius: "20px", height: "95px", boxShadow: "none" }}>
              <CardContent  sx={{ padding: 2, height: "70px", backgroundColor: "white" }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" height="100%">
                  {/* Left info */}
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography sx={{  fontSize: "20px", color: "black", fontWeight: "normal", width: 25, textAlign: "center" }}>
    
                    </Typography>
            
                    <Stack spacing={1} alignItems="flex-start">
                      <Typography sx={{  fontSize: "20px", fontWeight: "medium", color: "black"}}>
                      DHKTPM17A
                      </Typography>

                      {/* Info nằm cùng hàng */}
                      <Stack direction="row" spacing={4} justifyContent="center">
                        <Typography sx={{ fontFamily: "Poppins", fontSize: "14px", color: "#a5a5a5", textAlign: "center" }}>
                          Ngày tạo: 
                        </Typography>
                        <Typography sx={{ fontFamily: "Poppins", fontSize: "14px", color: "#a5a5a5", textAlign: "center" }}>
                          Ngày cập nhật: 
                        </Typography>
                        <Typography sx={{ fontFamily: "Poppins", fontSize: "14px", color: "#a5a5a5", textAlign: "center" }}>
                          Số câu hỏi: 
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>

                  {/* Right button */}
                  

                </Stack>
              </CardContent>
            </Card>
        
        </Stack>
      </Stack>
      

    

   
    </Box>
  );
};

export default Class;

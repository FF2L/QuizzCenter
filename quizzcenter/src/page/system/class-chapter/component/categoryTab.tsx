import AddIcon from "@mui/icons-material/Add";
import { useParams,useLocation } from "react-router-dom";
import CategoryIcon from "@mui/icons-material/Category";
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useState, use } from "react";
import { Chuong } from "../../../../common/model";
import CreateDialog from "./createDialog"; 
import { Delete, Edit, AddCircle } from "@mui/icons-material";
import UpdateDialog from "./updateDialog";
import { IconButton } from "@mui/material";
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



const CategoryTab = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);  //menu con
  const open = Boolean(anchorEl);
  const { idMonHoc } = useParams<{ idMonHoc: string }>();
  const [currentChuong, setCurrentChuong] = useState<Chuong | null>(null);
  const [chuongList, setChuongList] = useState<Chuong[]>([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { tenMonHoc } = location.state || {};
  const idMonHocNumber = Number(idMonHoc); 
  //mở create-dialog
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);

  const handleOpenCreateDialog = () => setOpenCreateDialog(true);
  const handleOpenUpdateDialog = ( chuong: Chuong)=>{
          setCurrentChuong(chuong)
          setOpenUpdateDialog(true);
           } 

  const handleCloseDialog = () =>{
    setOpenCreateDialog(false);
    setOpenUpdateDialog(false);
  }
  useEffect(() => {
    const fetchChuong = async () => {
      if (!idMonHoc) return;
      if (isNaN(idMonHocNumber)) return;

      setLoading(true);
      try {
        console.log("Fetching chương với idMonHoc:", idMonHocNumber);

                 const res = await fetch(`http://localhost:3000/chuong?idMonHoc=${idMonHocNumber}`, {
                 method: 'GET',
                 headers: { 'Content-Type': 'application/json' },
                 });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data: Chuong[] = await res.json();
        setChuongList(data);
        console.log(data)
      } catch (err) {
        console.error("Lỗi khi fetch chương:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChuong();
  }, [idMonHoc]);

  if (loading) return <p>Đang tải chương...</p>;
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>, chuong: Chuong) => {
    setAnchorEl(event.currentTarget);
    setCurrentChuong(chuong);
  };
  
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
              Danh mục
            </Typography>
          </Stack>

        </Stack>

        {/* Category List */}
        <Stack spacing={2}>
          <Box sx={{ flexDirection: "row", display: "flex", alignItems: "center",justifyContent:"space-between"  }}>
          <Box sx={{ flexDirection: "row", display: "flex", alignItems: "center"  }}>
          <Typography sx={{fontWeight:'bold',fontSize:"18px"}}>
            Môn học:
          </Typography>
          <Box sx={{backgroundColor:"rgba(255, 0, 0, 0.04)", borderRadius:"10px", height:"30px", width:"180px", display:"flex", justifyContent:'center', alignItems:"center"}}>
          <Typography sx={{color:"rgba(255, 0, 0, 1)", ml:1, fontWeight:'bold',fontSize:"18px"}}>{tenMonHoc}</Typography>
          </Box>
          <Typography sx={{ml:1,fontWeight:'bold',fontSize:"18px"}}> → Danh mục</Typography>
        </Box>
<Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
            sx={{
              backgroundColor: "#408C56",
              borderRadius:"50px",
              border:"1px black",
              height: "50px",
              width: "180px",
              fontSize: "16px",
              fontWeight: "bold",
              color:"white",
              textTransform: "none",
              "&:hover": { backgroundColor: "#D9D9D9", color:'black' },
            }}
          >
            Thêm danh mục
          </Button>


          </Box>
          {chuongList.map((chuong) => (
            <Card key={chuong.id}  sx={{ borderRadius: "20px", height: "95px", boxShadow: "none", border:"none"  }}>
              <CardContent  sx={{ padding: 2, height: "70px", backgroundColor: "white" }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" height="100%">
                  {/* Left info */}
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography sx={{  fontSize: "20px", color: "black", fontWeight: "normal", width: 25, textAlign: "center" }}>
                      {chuong.thuTu}
                    </Typography>
            
                    <Box sx={{ width: "1px", height: "70px", backgroundColor: "#A8A8A8" }} />

                    <Stack spacing={1} alignItems="flex-start">
                      <Typography sx={{  fontSize: "20px", fontWeight: "medium", color: "black"}}>
                        {chuong.tenChuong}
                      </Typography>

                      {/* Info nằm cùng hàng */}
                      <Stack direction="row" spacing={4} justifyContent="center">
                        <Typography sx={{ fontFamily: "Poppins", fontSize: "14px", color: "#a5a5a5", textAlign: "center" }}>
                          Số câu hỏi: {chuong.soLuongCauHoi}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>

                  {/* Right button */}
                  <Stack direction="row" spacing={1}>
                  <IconButton
          sx={{ color: "#245d51" }}
          onClick={() => {
            // gọi hàm thêm câu hỏi
          }}
        >
          <AddCircle />
        </IconButton>
        <IconButton
          sx={{ color: "#0DC913" }}
          onClick={() => {
            handleOpenUpdateDialog(chuong);
          }}
        >
          <Edit />
        </IconButton>
        <IconButton
          sx={{ color: "#d32f2f" }}
          onClick={() => {
            // gọi hàm xóa
          }}
        >
          <Delete />
        </IconButton>

       

      </Stack>

                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Stack>
      <CreateDialog 
       idMonHoc={idMonHocNumber}
       idGiangVien={2}
       open={openCreateDialog} 
       onClose={handleCloseDialog} 
       onCreated={(newChuong) => {
       setChuongList((prev) => {
      // gán thuTu = 1 cho chương mới
      const inserted = { ...newChuong, thuTu: 1 };

      // dịch các chương cũ xuống (thuTu + 1)
      const shifted = prev.map((c) => ({
        ...c,
        thuTu: c.thuTu + 1,
      }));

      return [inserted, ...shifted];
    });
    handleCloseDialog();
  }}
/>

    <UpdateDialog
      idMonHoc={idMonHocNumber}
      idGiangVien={2}
       open={openUpdateDialog} 
       onClose={handleCloseDialog} 
       currentChuong={currentChuong}
       onCreated={(updatedChuong) => {
        setChuongList((prev) =>
          prev.map((c) => (c.id === updatedChuong.id ? updatedChuong : c))
        );
        handleCloseDialog();
      }}
     />

    </Box>
  );
};

export default CategoryTab;

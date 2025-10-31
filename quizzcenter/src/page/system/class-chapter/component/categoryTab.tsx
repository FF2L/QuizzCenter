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
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { LectureService } from "../../../../services/lecture.api";

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
  const accessToken = localStorage.getItem('accessTokenGV') || '';
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const navigate = useNavigate();
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

       
        
        const result = await LectureService.layTatCaChuongTheoMonHoc(idMonHocNumber, accessToken);
        
        if (result.ok) {
          setChuongList(result.data);
          console.log(result.data);
        } else {
          console.error("Lỗi khi fetch chương:", result.error);
        }
      } catch (err) {
        console.error("Lỗi khi fetch chương:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChuong();
  }, [idMonHoc, idMonHocNumber]);

  if (loading) return <p>Đang tải chương...</p>;
  
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>, chuong: Chuong) => {
    setAnchorEl(event.currentTarget);
    setCurrentChuong(chuong);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteChuong = async (chuong: Chuong) => {
    // Kiểm tra xem chương có câu hỏi không
    if (chuong.soluongcauhoi && chuong.soluongcauhoi > 0) {
      alert("Không thể xóa chương này vì chương đã có câu hỏi!");
      return;
    }
  
    const confirmDelete = window.confirm(`Bạn có chắc muốn xóa chương "${chuong.tenchuong}" không?`);
    if (!confirmDelete) return;
  
    try {
      // Lấy token từ localStorage hoặc context
      const accessToken = localStorage.getItem('accessToken') || '';
      
      const result = await LectureService.xoaChuongTheoIdChuong(chuong.id, accessToken);
      
      if (result.ok) {
        // Xóa chương khỏi state
        setChuongList((prev) => prev.filter((c) => c.id !== chuong.id));
        alert("Xóa chương thành công!");
      } else {
        console.error("Lỗi khi xóa chương:", result.error);
        alert("Xóa chương thất bại!");
      }
    } catch (err: any) {
      console.error(err);
      alert("Xóa chương thất bại: " + err.message);
    }
  };
  
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        borderRadius: "10px",
        padding: 0,
      }}
    >
      <Stack spacing={3}>

        {/* Header */}
        <Stack direction="column" spacing={2}>
      
        <Box
  sx={{
    display: "flex",
    alignItems: "center",
    mb: 2,
    p: 1.5,
    borderRadius: 2,
    backgroundColor: "#f9f9f9",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  }}
>
  <Breadcrumbs
    aria-label="breadcrumb"
    separator="›"
    sx={{
      "& .MuiTypography-root": { fontSize: 15, color: "#555" },
    }}
  >
  </Breadcrumbs>
</Box>     
        </Stack>

        {/* Category List */}
        <Stack spacing={2}>
          <Box sx={{ flexDirection: "row", display: "flex", alignItems: "center",justifyContent:"space-between"  }}>
          <Typography variant="h3" sx={{  fontWeight: "medium", fontSize: "30px", color: "black" }}>
              Danh mục
            </Typography>
            <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            Thêm danh mục
          </Button>


          </Box>
          {chuongList.map((chuong) => (
            <Card key={chuong.id} 
            onClick={() =>
              navigate(`/lecturer/course/${idMonHoc}`, {
                state: {
                  idChuong: chuong.id,
                  tenChuong: chuong.tenchuong,
                  tenMonHoc: tenMonHoc,
                  tab: 1, // chuyển sang tab Ngân hàng câu hỏi
                },
              })
            }
            
            
           >
              <CardContent sx={{height:"50px"}}>
                
                  {/* Left info */}
                  <Stack direction="row" spacing={2}>
                    <Stack spacing={2} direction="row">
                      <Typography sx={{  fontSize: "20px", fontWeight: "medium", color: "black"}}>
                        {chuong.tenchuong}
                        <Typography sx={{ fontFamily: "Poppins", fontSize: "14px", color: "#a5a5a5", textAlign: "center" }}>
                          Số câu hỏi: {chuong.soluongcauhoi}
                        </Typography>
                      </Typography>

                      {/* Info nằm cùng hàng */}
                    </Stack>
                  </Stack>

                  {/* Right button */}
                  <Stack direction="row" spacing={1}>
                  
        <IconButton
          sx={{ color: "#0DC913" }}
          onClick={(event) => {
            event.stopPropagation();
            handleOpenUpdateDialog(chuong);
          }}
        >
          <Edit />
        </IconButton>
        {chuong.soluongcauhoi === 0 &&
      <IconButton
          sx={{ color: "#d32f2f" }}
          onClick={(event) =>{ 
            event.stopPropagation();
            handleDeleteChuong(chuong)}}
        >
          <Delete />
        </IconButton>
        }
        
      </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Stack>
      <CreateDialog 
       idMonHoc={idMonHocNumber}
       idGiangVien={2}
       accessToken={accessToken}
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
      accessToken={accessToken}
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
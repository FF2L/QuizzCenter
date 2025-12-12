import AddIcon from "@mui/icons-material/Add";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Chuong } from "../../../../common/model";
import CreateDialog from "./createDialog"; 
import { Delete, Edit } from "@mui/icons-material";
import UpdateDialog from "./updateDialog";
import { IconButton } from "@mui/material";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import { LectureService } from "../../../../services/lecture.api";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";

const CategoryTab = () => {
  const { idMonHoc } = useParams<{ idMonHoc: string }>();
  const [currentChuong, setCurrentChuong] = useState<Chuong | null>(null);
  const [chuongList, setChuongList] = useState<Chuong[]>([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { tenMonHoc } = location.state || {};
  const idMonHocNumber = Number(idMonHoc); 
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('accessTokenGV') || '';

  const handleOpenCreateDialog = () => setOpenCreateDialog(true);
  
  const handleOpenUpdateDialog = (chuong: Chuong) => {
    console.log("Mở dialog cập nhật với chương:", chuong);
    setCurrentChuong(chuong);
    setOpenUpdateDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenCreateDialog(false);
    setOpenUpdateDialog(false);
    setCurrentChuong(null);
  };

  // Fetch danh sách chương
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
          console.log("Danh sách chương ban đầu:", result.data);
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
  }, [idMonHoc, idMonHocNumber, accessToken]);

  // Xử lý xóa chương
  const handleDeleteChuong = async (chuong: Chuong) => {
    if (chuong.soluongcauhoi && chuong.soluongcauhoi !== "0") {
      alert("Không thể xóa chương này vì chương đã có câu hỏi!");
      return;
    }
  
    const confirmDelete = window.confirm(`Bạn có chắc muốn xóa chương "${chuong.tenchuong}" không?`);
    if (!confirmDelete) return;
  
    try {
      const result = await LectureService.xoaChuongTheoIdChuong(chuong.id, accessToken);
      
      if (result.ok) {
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

const handleChuongCreated = (newChuong: Chuong) => {
  console.log("Chương mới được tạo:", newChuong);
  console.log("Danh sách hiện tại trước khi thêm:", chuongList);
  
  setChuongList((prev) => {
    // KHÔNG tự tạo object mới, dùng trực tiếp data từ API
    const newList = [newChuong, ...prev];
    console.log("Danh sách sau khi thêm:", newList);
    return newList;
  });
  
  handleCloseDialog();
};

  // Xử lý sau khi cập nhật chương
  const handleChuongUpdated = (updatedChuong: Chuong) => {
    console.log("Nhận được chương cập nhật:", updatedChuong);
    console.log("ID chương cần cập nhật:", updatedChuong.id);
    console.log("Danh sách hiện tại trước khi cập nhật:", chuongList);
    
    setChuongList((prev) => {
      const newList = prev.map((c) => {
        if (c.id === updatedChuong.id) {
          console.log("Tìm thấy chương cần cập nhật:", c);
          console.log("Cập nhật thành:", updatedChuong);
          return updatedChuong;
        }
        return c;
      });
      console.log("Danh sách sau khi cập nhật:", newList);
      return newList;
    });
    
    handleCloseDialog();
  };

  if (loading) return <p>Đang tải chương...</p>;
  
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
          <Box sx={{ 
            flexDirection: "row", 
            display: "flex", 
            alignItems: "center",
            justifyContent:"space-between"  
          }}>
            <Typography variant="h3" sx={{  
              fontWeight: "medium", 
              fontSize: "30px", 
              color: "black" 
            }}>
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
            <Card 
              key={chuong.id} 
              onClick={() =>
                navigate(`/lecturer/course/${idMonHoc}`, {
                  state: {
                    idChuong: chuong.id,
                    tenChuong: chuong.tenchuong,
                    tenMonHoc: tenMonHoc,
                    tab: 1,
                  },
                })
              }
            >
              <CardContent sx={{height:"50px"}}>
                <Stack direction="column" spacing={2}>
                  <Stack spacing={2} direction="column">
                    <Typography sx={{  
                      fontSize: "20px", 
                      fontWeight: "medium", 
                      color: "black"
                    }}>
                      {chuong.tenchuong || "Chưa có tên"}
                    </Typography>
                  </Stack>
                  <Stack>
                  <Typography sx={{ 
                        fontFamily: "Poppins", 
                        fontSize: "14px", 
                        color: "#a5a5a5", 
                      }}>
                        Số câu hỏi: {chuong.soluongcauhoi || 0}
                      </Typography>
                  </Stack>
                </Stack>

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
                    <IconButton
                      sx={{ color: "#d32f2f" }}
                      onClick={(event) => { 
                        event.stopPropagation();
                        handleDeleteChuong(chuong);
                      }}
                    >
                      <Delete />
                    </IconButton>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Stack>

      {/* Create Dialog */}
      <CreateDialog 
        idMonHoc={idMonHocNumber}
        idGiangVien={2}
        accessToken={accessToken}
        open={openCreateDialog} 
        onClose={handleCloseDialog} 
        onCreated={handleChuongCreated}
      />

      {/* Update Dialog */}
      <UpdateDialog
        idMonHoc={idMonHocNumber}
        idGiangVien={2}
        accessToken={accessToken}
        open={openUpdateDialog} 
        onClose={handleCloseDialog} 
        currentChuong={currentChuong}
        onCreated={handleChuongUpdated}
      />
    </Box>
  );
};

export default CategoryTab;
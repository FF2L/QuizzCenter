// BaiKiemTraList.tsx
import React, { useEffect, useState } from "react";
import { useParams,useLocation } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import { BaiKiemTra } from "../../../common/model";
import CreateBaiKiemTraDialog from "../test/createTestDialog";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ViewBaiKiemTraDialog from "../test/testDetailDalog";
import UpdateBaiKiemTraDialog from "../test/updateTestDialog"; 
import { useNavigate } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Breadcrumbs from "@mui/material/Breadcrumbs";

const BaiKiemTraList = () => {
  const { idLopHocPhan } = useParams<{ idLopHocPhan: string }>();
  const [baiKiemTraList, setBaiKiemTraList] = useState<BaiKiemTra[]>([]);
  const [loading, setLoading] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  // Dialog
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [selectedBai, setSelectedBai] = useState<BaiKiemTra | null>(null);
  const location = useLocation();
  const { tenMonHoc,tenLopHoc } = location.state || {};

  const navigate = useNavigate();
  useEffect(() => {
    const fetchBaiKiemTra = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:3000/bai-kiem-tra/${idLopHocPhan}`
        );
        const data: BaiKiemTra[] = await res.json();
        data.sort(
          (a, b) =>
            new Date(b.update_at).getTime() - new Date(a.update_at).getTime()
        );
        setBaiKiemTraList(data);
      } catch (error) {
        console.error("Lỗi fetch bài kiểm tra:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBaiKiemTra();
  }, [idLopHocPhan]);

  const handleCreateBaiKiemTra = async (payload: any) => {
    try {
      const res = await fetch("http://localhost:3000/bai-kiem-tra", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const newBaiKiemTra = await res.json();
        setBaiKiemTraList((prev) => [newBaiKiemTra, ...prev]);
        setOpenCreateDialog(false);
      } else {
        console.error("Tạo bài kiểm tra thất bại");
      }
    } catch (error) {
      console.error("Lỗi tạo bài kiểm tra:", error);
    }
  };

  const handleUpdateBaiKiemTra = async (id: number, payload: any) => {
    try {
      const res = await fetch(`http://localhost:3000/bai-kiem-tra/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      if (res.ok) {
        const updated = await res.json();
        setBaiKiemTraList((prev) =>
          prev.map((b) => (b.id === id ? updated : b))
        );
        setOpenUpdateDialog(false);
      } else {
        console.error("Cập nhật thất bại");
        alert("Cập nhật thất bại!");
      }
    } catch (error) {
      console.error("Lỗi cập nhật:", error);
      alert("Có lỗi xảy ra khi cập nhật.");
    }
  };

  // Xem chi tiết
  const handleViewDetail = (bai: BaiKiemTra) => {
    setSelectedId(bai.id);
    setOpenViewDialog(true);
  };

  // Cập nhật
  const handleUpdate = (bai: BaiKiemTra) => {
    setSelectedBai(bai);
    setOpenUpdateDialog(true);
  };

  // Xóa
  // Xóa
const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài kiểm tra này?")) return;
  
    try {
      const res = await fetch(`http://localhost:3000/bai-kiem-tra/${id}`, {
        method: "DELETE",
      });
  
      if (res.ok) {
        // Xóa thành công -> cập nhật lại danh sách
        setBaiKiemTraList((prev) => prev.filter((b) => b.id !== id));
      } else {
        const errorText = await res.text();
        console.error("Xóa thất bại:", errorText);
        alert("Xóa thất bại!");
      }
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      alert("Có lỗi xảy ra khi xóa.");
    }
  };
  

  return (
    <Box sx={{ p: 2 , backgroundColor:"#F8F8F8"}}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <IconButton onClick={() => navigate(-1)}>
      <ArrowBackIcon />
    </IconButton>
        <Typography variant="h4">Bài kiểm tra</Typography>
        </Box>
        <Button  sx={{backgroundColor:"#245D51"}} variant="contained" onClick={() => setOpenCreateDialog(true)}>
          Tạo bài kiểm tra
        </Button>
      </Stack>
      <Box
  sx={{
    display: "flex",
    alignItems: "center",
    mb: 2,
    backgroundColor: "#f9f9f9",
    p: 1.5,
    borderRadius: 2,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  }}
>
  <Breadcrumbs
    aria-label="breadcrumb"
    separator="›"
    sx={{
      color: "#555",
      "& .MuiTypography-root": { fontSize: 15 },
    }}
  >
    <Typography sx={{ color: "#555" }}>
      Môn học (
      <span style={{ color: "#e91e63" }}>{tenMonHoc}</span>
      )
    </Typography>

    <Typography sx={{ color: "#555" }}>
      Lớp học (
      <span style={{ color: "#007CD5" }}>{tenLopHoc}</span>
      )
    </Typography>

    <Typography sx={{ color: "#555", fontWeight:"bold" }}>
      Bài kiểm tra
    </Typography>
  </Breadcrumbs>
</Box>


      {/* Danh sách */}
      <Stack spacing={2}>
        {loading && <Typography>Đang tải...</Typography>}
        {!loading && baiKiemTraList.length === 0 && (
          <Typography>Chưa có bài kiểm tra nào.</Typography>
        )}

        {!loading &&
          baiKiemTraList.map((bai) => (
            <Card   onClick={() => navigate(`/bai-kiem-tra/${bai.id}`,{ state: { tenLopHoc: tenLopHoc,tenMonHoc,  tenBaiKiemTra: bai.tenBaiKiemTra  } })} 
                    key={bai.id} 
                   >
              <CardContent>
                  {/* Info */}
                  <Stack spacing={1}>
                    <Typography sx={{fontWeight:'bold'}}>
                      {bai.tenBaiKiemTra}
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: "#555" }}>
                      Loại kiểm tra: {bai.loaiKiemTra} | Số lần làm:{" "}
                      {bai.soLanLam}
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: "#555" }}>
                      Thời gian:{" "}
                      {new Date(bai.thoiGianBatDau).toLocaleDateString()} -{" "}
                      {new Date(bai.thoiGianKetThuc).toLocaleDateString()} | Thời
                      gian làm: {bai.thoiGianLam / 60} phút
                    </Typography>
                  </Stack>

                  {/* Actions */}
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      sx={{
                        color:"#DB9C14"
                      }}
                      onClick={(e) => {
                        e.stopPropagation(); 
                        handleViewDetail(bai);
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      sx={{ color: "#0DC913" }}
                      onClick={(e) => {
                        e.stopPropagation(); 
                        handleUpdate(bai)}}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                       sx={{
                        color: "#d32f2f" 
                      }}
                      onClick={(e) => {
                        e.stopPropagation(); 
                        handleDelete(bai.id)}}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
              </CardContent>
            </Card>
          ))}
      </Stack>

      {/* Import Dialog */}
      <CreateBaiKiemTraDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onCreate={handleCreateBaiKiemTra}
        idLopHocPhan={Number(idLopHocPhan)}
      />
      <ViewBaiKiemTraDialog
  open={openViewDialog}
  onClose={() => setOpenViewDialog(false)}
  idBaiKiemTra={selectedId}
/>
<UpdateBaiKiemTraDialog
  open={openUpdateDialog}
  onClose={() => setOpenUpdateDialog(false)}
  baiKiemTra={selectedBai}
  onUpdate={handleUpdateBaiKiemTra}
/>
    </Box>
  );
};

export default BaiKiemTraList;

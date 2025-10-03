// BaiKiemTraList.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h4">Danh sách bài kiểm tra</Typography>
        <Button  sx={{backgroundColor:"#245D51"}} variant="contained" onClick={() => setOpenCreateDialog(true)}>
          Tạo bài kiểm tra
        </Button>
      </Stack>

      {/* Danh sách */}
      <Stack spacing={2}>
        {loading && <Typography>Đang tải...</Typography>}
        {!loading && baiKiemTraList.length === 0 && (
          <Typography>Chưa có bài kiểm tra nào.</Typography>
        )}

        {!loading &&
          baiKiemTraList.map((bai) => (
            <Card   onClick={() => navigate(`/bai-kiem-tra/${bai.id}`)} 
                    key={bai.id} 
                    sx={{ borderRadius: 2, boxShadow: "none" }}>
              <CardContent sx={{ backgroundColor: "#fff" }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  {/* Info */}
                  <Stack spacing={1}>
                    <Typography sx={{ fontSize: 18, fontWeight: "medium" }}>
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
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation(); 
                        handleViewDetail(bai);
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      color="warning"
                      onClick={(e) => {
                        e.stopPropagation(); 
                        handleUpdate(bai)}}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation(); 
                        handleDelete(bai.id)}}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
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

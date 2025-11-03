import React, { useEffect, useState } from "react";
import { useNavigate, useParams,useLocation } from "react-router-dom";
import {
  Box,
  Stack,
  Typography,
  Button,
  Card,
  CardContent,
  Pagination,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import { BaiKiemTra, CauHoiPayload } from "../../../common/model";
import { Delete, Edit, Visibility } from "@mui/icons-material";

import CategoryIcon from "@mui/icons-material/Category";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import TimerIcon from "@mui/icons-material/Timer";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import QuestionDetailDialog from "../bankquestion/deTailDialog";
import DeleteConfirmDialog from "../bankquestion/deleteConfirmDialog";
import UpdateQuestionDialog from "../bankquestion/updateQuestion";

const BaiKiemTraDetail: React.FC = () => {
  const { idBaiKiemTra } = useParams<{ idBaiKiemTra: string }>();
  const [bai, setBai] = useState<BaiKiemTra | null>(null);
  const [cauHoiList, setCauHoiList] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const navigate = useNavigate();
  const [currentQuestionDetail, setCurrentQuestionDetail] = useState<CauHoiPayload | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<{ id: number; name: string; } | null>(null);  
  const [updateQuestionId, setUpdateQuestionId] = useState<number | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [monHoc, setMonHoc] = useState<  any | null>(null);  
  const location = useLocation();
  const { tenMonHoc,tenLopHoc,tenBaiKiemTra,idMonHoc } = location.state || {};
  const limit = 5;
  // menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const accessToken = localStorage.getItem('accessTokenGV') || '';

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // fetch chi tiết bài kiểm tra
  useEffect(() => {
    const fetchDetail = async () => {
      if (!idBaiKiemTra) return;
      try {
        const res = await fetch(
          `http://localhost:3000/bai-kiem-tra/findone/${idBaiKiemTra}`
        );
        if (!res.ok) throw new Error("Không tìm thấy bài kiểm tra");
        const data: BaiKiemTra = await res.json();
        setBai(data);
      } catch (err) {
        console.error("Lỗi fetch bài kiểm tra:", err);
      }
    };
    fetchDetail();
  }, [idBaiKiemTra]);

    //xem chi tiet
    const fetchQuestionDetail = async (id: number) => {
      try {
        const res = await fetch(`http://localhost:3000/cau-hoi/${id}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data: CauHoiPayload = await res.json();
        setCurrentQuestionDetail(data);
        setOpenDetailDialog(true);
      } catch (err) {
        console.error("Lỗi khi fetch chi tiết câu hỏi:", err);
      }
    };

    //xoa cau hoi
const handleDeleteQuestion = async () => {
  if (!questionToDelete) return;

  try {
    const res = await fetch(`http://localhost:3000/bai-kiem-tra/chi-tiet-cau-hoi/${questionToDelete.id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    // Cập nhật lại UI
    setCauHoiList(cauHoiList.filter((q) => q.id  !== questionToDelete.id));
    setOpenDeleteDialog(false);
    setQuestionToDelete(null);
    alert("Xóa thành công!");
  } catch (err) {
    console.error("Lỗi khi xóa câu hỏi:", err);
    alert("Xóa thất bại!");
  }
};

const fetchidMonHoc = async (): Promise<{ id: number; tenMonHoc: string } | null> => {
  if (!idBaiKiemTra) return null;
  try {
    const res = await fetch(`http://localhost:3000/bai-kiem-tra/${idBaiKiemTra}/mon-hoc`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    const mh = await res.json();
    const result = { id: mh.id, tenMonHoc: mh.tenMonHoc };
    setMonHoc(result); // optional
    return result;
  } catch (err) {
    console.error("Lỗi khi lấy môn học:", err);
    return null;
  }
};

  // fetch câu hỏi
  // fetch câu hỏi
useEffect(() => {
  const fetchCauHoi = async () => {
    if (!idBaiKiemTra || !bai) return;
    const skip = (page - 1) * limit;

    try {
      const res = await fetch(
        `http://localhost:3000/bai-kiem-tra/${idBaiKiemTra}/chi-tiet-cau-hoi?skip=${skip}&limit=${limit}`,
        {
          headers: {
            "Authorization": `Bearer ${accessToken}`, // thêm token
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) throw new Error("Không tìm thấy câu hỏi");

      const result = await res.json();

      if (Array.isArray(result.data) && typeof result.total === "number") {
        setCauHoiList(result.data);
        setTotalPage(result.totalPages || 1);
      } else {
        setCauHoiList([]);
        setTotalPage(1);
      }
    } catch (err) {
      console.error("Lỗi fetch câu hỏi:", err);
      setCauHoiList([]);
      setTotalPage(1);
    }
  };

  fetchCauHoi();
}, [idBaiKiemTra, page, bai, accessToken]);


  return (
    <Box sx={{ p: 3, backgroundColor:"#F8F9FA", width: "100%", minHeight: "100vh"}}>
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

    <Typography sx={{ color: "#555" }}>
      Bài kiểm tra
    </Typography>

    <Typography sx={{ color: "black" }}>
    <span style={{ fontWeight:"bold" }}>{tenBaiKiemTra}</span>
    </Typography>
  </Breadcrumbs>
</Box>
      {bai && (
        <>
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
            <Typography variant="h3" sx={{ fontWeight: "medium", fontSize: "30px", color: "black"}}>{bai.tenBaiKiemTra}</Typography>
            </Box>
            <div>
              {(new Date(bai.thoiGianKetThuc) > new Date()) && (
                <Button
                variant="contained"
                color="primary"
                onClick={handleClick}
              >
                Thêm câu hỏi
              </Button>
              )}
              
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
              >
                <MenuItem
                  onClick={() => {
                    if (!idBaiKiemTra) return;
                    navigate(`/bai-kiem-tra/${idBaiKiemTra}/create-question-test`, {
                      state: {
                        idBaiKiemTra: Number(idBaiKiemTra),
                        // idMonHoc: bai?.idMonHoc,          // nếu có
                        // tenMonHoc: bai?.tenMonHoc,        // nếu có
                        tenBaiKiemTra: bai?.tenBaiKiemTra // nếu có
                      }
                    });
                  }}
                >
                  Tạo thủ công
                </MenuItem>
               <MenuItem
  onClick={async () => {
    handleClose();
    if (!idBaiKiemTra) return;

    const mh = await fetchidMonHoc();       // 🔴 chờ fetch xong
    if (!mh) {
      alert("Không lấy được môn học!");
      return;
    }

    navigate(`/lecturer/select-from-bank`, {
      state: {
        idBaiKiemTra: Number(idBaiKiemTra),
        idMonHoc,                   
        tenMonHoc: mh.tenMonHoc,
        tenBaiKiemTra: bai?.tenBaiKiemTra,
      },
    });
  }}
>
  Ngân hàng câu hỏi
</MenuItem>

                {/* <MenuItem onClick={() => { handleClose(); alert("Excel"); }}>
                  Excel
                </MenuItem> */}
              </Menu>
            </div>
          </Stack>

          {/* Thông tin */}
          
          <Box
  sx={{
    display: "grid",
    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
    gap: 2,
    p: 3,
    borderRadius: 3,
    border: "1px solid #c8f5d4",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    width: "100%",
  }}
>
  {/* Loại kiểm tra */}
  <Box sx={{ display: "flex", alignItems: "center" }}>
    <CategoryIcon sx={{ color: "#00bfa5", mr: 1 }} />
    <Typography variant="body1">
      <strong>Loại:</strong>&nbsp;{bai.loaiKiemTra}
    </Typography>
  </Box>

  {/* Số lần làm */}
  {/* <Box sx={{ display: "flex", alignItems: "center" }}>
    <AssignmentIcon sx={{ color: "#00796b", mr: 1 }} />
    <Typography variant="body1">
      <strong>Số lần làm:</strong>&nbsp;{bai.soLanLam}
    </Typography>
  </Box> */}

  {/* Thời gian làm */}
  <Box sx={{ display: "flex", alignItems: "center" }}>
    <TimerIcon sx={{ color: "#0288d1", mr: 1 }} />
    <Typography variant="body1">
      <strong>Thời gian làm:</strong>&nbsp;{bai.thoiGianLam / 60} phút
    </Typography>
  </Box>

  {/* Thời gian mở đề*/}
  <Box sx={{ display: "flex", alignItems: "center" }}>
    <AccessTimeIcon sx={{ color: "#00acc1", mr: 1 }} />
    <Typography variant="body1">
      <strong>Thời gian mở đề:</strong>&nbsp;
      {new Date(bai.thoiGianBatDau).toLocaleString()}
    </Typography>
  </Box>
  {/* Thời gian đóng đề */}
    <Box sx={{ display: "flex", alignItems: "center" }}>
    <AccessTimeIcon sx={{ color: "#00acc1", mr: 1 }} />
    <Typography variant="body1">
      <strong>Thời gian đóng đề:</strong>&nbsp;
      {new Date(bai.thoiGianKetThuc).toLocaleString()}
    </Typography>
  </Box>

</Box>



          {/* Danh sách câu hỏi */}
          <Stack spacing={2}>
          <Box
    sx={{
      border: "1px solid #ddd",
      borderRadius: "12px",
      p: 2,
      backgroundColor: "#fafafa",
    }}
  >
            {cauHoiList.map((item: any,index) => (
              <Card key={item.id} sx={{mb: 2, boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
              "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}}>
                <CardContent sx={{ height:"20px",}}>
                  <Stack spacing={2} direction="row">
                <Typography sx={{ fontWeight: "bold" }}>
               Câu {index + 1}:
              </Typography>
                  <Typography >
                    {item.__cauHoi__?.tenHienThi}
                  </Typography>
                  </Stack>
                  <Typography sx={{color:"#898989"}}>
                    {item.__cauHoi__?.noiDungCauHoi}
                  </Typography>

                  {item.dapAn?.map((da: any) => (
                    <Typography key={da.id} sx={{ ml: 2 }}>
                      - {da.noiDung} {da.dapAnDung ? "(Đúng)" : ""}
                    </Typography>
                  ))}
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    mt={1}
                  >
                  

                  <Stack direction="row" spacing={1}  sx={{ flexShrink: 0 }}>
                    
                    {/* Cập nhật */}
                    {(new Date(bai.thoiGianKetThuc) > new Date()) && (
                      <IconButton
                        sx={{ color: "#0DC913" }}
                    
                        onClick={() => {
                          setUpdateQuestionId(item.__cauHoi__.id);   // lưu id câu hỏi
                          setOpenUpdateDialog(true);          // mở dialog update
                        }}
                    >
                      <Edit />
                    </IconButton>
                    )}
                    
                  <IconButton
                    sx={{
                      color:"#DB9C14"
                    }}
                    onClick={() => {
                      if (item.__cauHoi__?.id) {
                        fetchQuestionDetail(item.__cauHoi__?.id);
                      }
                    }}
                  >
                    <Visibility />
                  </IconButton>
                  {/* Xóa */}
                  {(new Date(bai.thoiGianKetThuc) > new Date()) && (
                    <IconButton
                      sx={{
                        color: "#d32f2f" 
                      }}
                      onClick={() => {
                        setQuestionToDelete({id: item.id, name: item.__cauHoi__.tenHienThi});
                        setOpenDeleteDialog(true);
                      }}
                    >
                      <Delete />
                    </IconButton>
                  )}
                  </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
            </Box>
          </Stack>
                 <QuestionDetailDialog
                  open={openDetailDialog}
                  onClose={() => setOpenDetailDialog(false)}
                  questionDetail={currentQuestionDetail}
                  />

                <DeleteConfirmDialog
                open={openDeleteDialog}
                onClose={() => setOpenDeleteDialog(false)}
                onConfirm={handleDeleteQuestion}
                questionName={questionToDelete?.name}
                />

                {/* <UpdateQuestionDialog
                  open={openUpdateDialog}
                  onClose={() => setOpenUpdateDialog(false)}
                  cauHoiId={updateQuestionId ?? 0}
                  onUpdated={(payload) => {
                    const fullPayload: CauHoiPayload = {
                      ...payload,
                      mangFileDinhKem: (payload as CauHoiPayload).mangFileDinhKem ?? []
                    };
                  
                    setCauHoiList((prev) =>
                      prev.map((q) =>
                        q.__cauHoi__.id === fullPayload.cauHoi.id ? fullPayload : q
                      )
                    );
                  }}
                /> */}

          {/* Phân trang */}
          <Box mt={3}>
            <Pagination
              count={totalPage}
              page={page}
              onChange={(_, value) => setPage(value)}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default BaiKiemTraDetail;
import AddIcon from "@mui/icons-material/Add";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Chuong, CauHoi, CauHoiPayload } from "../../../common/model";
import { IconButton, Autocomplete, Box, Button, Card, CardContent, Stack, TextField, Typography, MenuItem, Pagination } from "@mui/material";
import { Delete, Edit, Visibility } from "@mui/icons-material";

import DeleteConfirmDialog from "./deleteConfirmDialog";
import CreateQuestionDialog from "./createQuestionDialog";
import QuestionDetailDialog from "./deTailDialog";
import UpdateQuestionDialog from "./updateQuestionDialog";
import Breadcrumbs from "@mui/material/Breadcrumbs";

const BankQuestion = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);  //menu con
  const open = Boolean(anchorEl);
  const [selectedChuongName, setSelectedChuongName] = useState("");
  const { idMonHoc } = useParams<{ idMonHoc: string }>();
  const [chuongList, setChuongList] = useState<Chuong[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { tenMonHoc } = location.state || {};
  const { tenChuong } = location.state || {};
  const idMonHocNumber = Number(idMonHoc);
  const [currentQuestionDetail, setCurrentQuestionDetail] = useState<CauHoiPayload | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Dialogs
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Questions
  const [questions, setQuestions] = useState<CauHoiPayload[]>([]);
  const [questionToDelete, setQuestionToDelete] = useState<{ id: number; name: string } | null>(null);
  const [updateQuestionId, setUpdateQuestionId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const navigate = useNavigate();

  const handleChangePage = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const paginatedQuestions = questions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  useEffect(() => {
    if (location.state?.idChuong) {
      setSelectedCategory(location.state.idChuong.toString());   //lay chuong từ page Danh mục 
      setSelectedChuongName(location.state.tenChuong);
    }
  }, [location.state]);
  // Fetch chapter list
  useEffect(() => {
    const fetchChuong = async () => {
      if (!idMonHocNumber) return;
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/chuong?idMonHoc=${idMonHocNumber}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data: Chuong[] = await res.json();
        setChuongList(data);

        const defaultChuong = location.state?.idChuong 
          ? data.find(c => c.id === Number(location.state.idChuong))
          : data[0];

        if (defaultChuong) {
          setSelectedCategory(defaultChuong.id.toString());
          setSelectedChuongName(defaultChuong.tenChuong);
        }
      } catch (err) {
        console.error("Lỗi khi fetch chương:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChuong();
  }, [idMonHocNumber, location.state]);

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!selectedCategory) return;
      try {
        const res = await fetch(`http://localhost:3000/chuong/${selectedCategory}/cau-hoi`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data: CauHoi[] = await res.json();
        const payloads: CauHoiPayload[] = data.map(cauHoi => ({
          cauHoi,
          dapAn: [],
          mangFileDinhKem: []
        }));
        setQuestions(payloads);
        setCurrentPage(1); // reset về trang 1 khi đổi category
      } catch (err) {
        console.error("Lỗi khi fetch câu hỏi:", err);
      }
    };
    fetchQuestions();
  }, [selectedCategory]);

  // Fetch question detail
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

  // Delete question
  const handleDeleteQuestion = async () => {
    if (!questionToDelete) return;
    try {
      const res = await fetch(`http://localhost:3000/cau-hoi/${questionToDelete.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      setQuestions(questions.filter(q => q.cauHoi.id !== questionToDelete.id));
      setOpenDeleteDialog(false);
      setQuestionToDelete(null);
      alert("Xóa thành công!");
    } catch (err) {
      console.error("Lỗi khi xóa câu hỏi:", err);
      alert("Xóa thất bại!");
    }
  };

  // File upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) { alert("Vui lòng chọn file Excel trước!"); return; }
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch(`http://localhost:3000/gui-file/cau-hoi/${selectedCategory}`, {
        method: "POST",
        body: formData
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      alert("Upload thành công!");

      // Refresh questions
      const refresh = await fetch(`http://localhost:3000/chuong/${selectedCategory}/cau-hoi`);
      const data: CauHoi[] = await refresh.json();
      const payloads: CauHoiPayload[] = data.map(cauHoi => ({
        cauHoi,
        dapAn: [],
        mangFileDinhKem: []
      }));
      setQuestions(payloads);
      setSelectedFile(null);
    } catch (err) {
      console.error("Lỗi khi upload file:", err);
      alert("Upload thất bại!");
    }
  };

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", borderRadius: "10px", padding: 0 }}>
      <Stack spacing={10}>
        {/* Header + Search */}
        <Box sx={{ flexDirection: "row", display: "flex", alignItems: "center"  }}>
        <Breadcrumbs
         sx={{ color: "black" }}
      aria-label="breadcrumb"
      separator="•" 
    >
          <Typography >
            Môn học(
                             <span style={{ color: "red" }}>{tenMonHoc}</span>
                              )
          </Typography>
          
          <Typography sx={{ml:1,color:'#898989'}}> Ngân hàng câu hỏi</Typography>
          </Breadcrumbs>
        </Box>
       
          
          <Box sx={{ display:'flex', alignItems:'center', mt: 2 }}>
            <Typography variant="h3" sx={{ fontWeight: "bold", fontSize: "30px", color: "black" }}>
              Ngân hàng câu hỏi
            </Typography>
          </Box>
 
        
        <Stack direction="row" justifyContent="space-between">
        {/* Category select */}
        <Stack direction="row" spacing={5}>
        <TextField
          select
          label="Chọn danh mục"
          value={selectedCategory}
          onChange={(e) => {
            const selectedId = e.target.value;
            setSelectedCategory(selectedId);
            const chuong = chuongList.find(c => c.id.toString() === selectedId);
            setSelectedChuongName(chuong?.tenChuong || "");
          }}
          sx={{ width: 250, backgroundColor: "white", borderRadius: "10px" }}
        >
          {chuongList.map(chuong => (
            <MenuItem key={chuong.id} value={chuong.id.toString()}>
               {chuong.tenChuong}
            </MenuItem>
          ))}
        </TextField>

        <Autocomplete
              options={[]}
              sx={{
                width: "300px",
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  height: "50px",
                },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Tìm kiếm câu hỏi ..."
                  sx={{
                    "& .MuiInputBase-input": {
                      color: "black",
                      fontSize: "16px",
                      fontWeight: "medium",
                      fontFamily: "Poppins",
                    },
                  }}
                />
              )}
            />
        </Stack>
        <Stack direction="row" spacing={2}>
            <Button
              color="primary"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/create-question', {
                state: {
                  idChuong: Number(selectedCategory),
                  idMonHoc: idMonHoc,
                  tenMonHoc: tenMonHoc,
                  tenChuong: selectedChuongName,
                  returnPath: location.pathname,
                  returnTab: "bankQuestion"
                }
              })}
            >
              Thêm câu hỏi
            </Button>

            <Button
              color="secondary"
              variant="outlined"
              onClick={() => fileInputRef.current?.click()}
            >
              <img src="/assets/FileIcon.png" style={{height:"30px", width:"30px"}} />
              Nhập File
              <input type="file" hidden accept=".xlsx,.xls" ref={fileInputRef} onChange={handleFileChange} />
            </Button>

            {selectedFile && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleUpload}
              >
                Tải lên
              </Button>
            )}
          </Stack>
     </Stack>
        {/* Questions list */}
        <Box sx={{ maxHeight: "60vh" }}>
  {/* Label tiêu đề */}
  <Typography

    sx={{
      mb: 2,
      color: "#245D51",
    }}
  >
    Danh sách câu hỏi
  </Typography>

  {/* Vùng chứa danh sách */}
  <Box
    sx={{
      border: "1px solid #ddd",
      borderRadius: "12px",
      p: 2,
      backgroundColor: "#fafafa",
    }}
  >
    {paginatedQuestions.map((q, index) => (
      <Card
        key={q.cauHoi.id}
        sx={{
          mb: 2,
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.15)" },
          backgroundColor: "#ffffff",
        }}
      >
        <CardContent
          sx={{
            height:"20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Cụm chữ bên trái */}
          <Stack direction="row" spacing={2}>
            <Typography sx={{ fontSize: "20px", fontWeight: "bold" }}>
              Câu {(currentPage - 1) * itemsPerPage + index + 1}:
            </Typography>
            <Typography sx={{ fontSize: "20px", fontWeight: "medium" }}>
              {q.cauHoi.tenHienThi}
            </Typography>
          </Stack>

          {/* Cụm icon bên phải */}
          <Stack direction="row">
            <IconButton
              sx={{ color: "#0DC913" }}
              onClick={() => {
                setUpdateQuestionId(q.cauHoi.id);
                setOpenUpdateDialog(true);
              }}
            >
              <Edit />
            </IconButton>

            <IconButton
              sx={{ color: "#DB9C14" }}
              onClick={() => fetchQuestionDetail(q.cauHoi.id)}
            >
              <Visibility />
            </IconButton>

            <IconButton
              sx={{ color: "#d32f2f" }}
              onClick={() => {
                setQuestionToDelete({
                  id: q.cauHoi.id,
                  name: q.cauHoi.tenHienThi,
                });
                setOpenDeleteDialog(true);
              }}
            >
              <Delete />
            </IconButton>
          </Stack>
        </CardContent>
      </Card>
    ))}
  </Box>
</Box>

        {/* Pagination */}
        <Stack alignItems="center" sx={{ mt: 2 }}>
          <Pagination
            count={Math.ceil(questions.length / itemsPerPage)}
            page={currentPage}
            onChange={handleChangePage}
            color="primary"
          />
        </Stack>

      </Stack>

      {/* Dialogs */}
      <CreateQuestionDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        idChuong={Number(selectedCategory)}
        onCreated={(payload: CauHoiPayload) => {
          setQuestions([payload, ...questions]);
          setOpenCreateDialog(false);
        }}
      />
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
      <UpdateQuestionDialog
        open={openUpdateDialog}
        onClose={() => setOpenUpdateDialog(false)}
        cauHoiId={updateQuestionId ?? 0}
        onUpdated={(payload) => {
          const fullPayload: CauHoiPayload = {
            ...payload,
            mangFileDinhKem: (payload as CauHoiPayload).mangFileDinhKem ?? []
          };
          setQuestions(prev => prev.map(q => q.cauHoi.id === fullPayload.cauHoi.id ? fullPayload : q));
        }}
      />
    </Box>
  );
};

export default BankQuestion;

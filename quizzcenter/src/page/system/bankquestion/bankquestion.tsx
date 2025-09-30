import AddIcon from "@mui/icons-material/Add";
import { useParams,useLocation } from "react-router-dom";
import CategoryIcon from "@mui/icons-material/Category";
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useState, use } from "react";
import { Chuong,CauHoi,DapAn,CauHoiPayload } from "../../../common/model";
import { IconButton } from "@mui/material";
import { Delete, Edit, Visibility  } from "@mui/icons-material";
import DeleteConfirmDialog from "./deleteConfirmDialog"
import { useRef } from "react";

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
import CreateQuestionDialog from "./createQuestionDialog"
import QuestionDetailDialog from "./deTailDialog"
import UpdateQuestionDialog from "./updateQuestionDialog";

const BankQuestion = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);  //menu con
  const open = Boolean(anchorEl);

  const { idMonHoc } = useParams<{ idMonHoc: string }>();
  const [chuongList, setChuongList] = useState<Chuong[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { tenMonHoc } = location.state || {};
  const idMonHocNumber = Number(idMonHoc);
  const [currentQuestion, setCurrentQuestion] = useState<CauHoiPayload | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  //mở create-dialog
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [currentQuestionDetail, setCurrentQuestionDetail] = useState<CauHoiPayload | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<{ id: number; name: string; } | null>(null);  
  const [questions, setQuestions] = useState<CauHoiPayload[]>([]);
  const [updateQuestionId, setUpdateQuestionId] = useState<number | null>(null);

  const newId = Date.now(); // id giả cho câu hỏi


  const LOAI_CAU_HOI_MAP: Record<string, string> = {
    MotDung: "Single Answer",
    NhieuDung: "MultiChoice Answer",
    // nếu có thêm loại khác, thêm vào đây
  };
 //selectTextField
  useEffect(() => {
    const fetchChuong = async () => {
      if (!idMonHocNumber) return;

      setLoading(true);
      try {
        const res = await fetch(`http://localhost:3000/chuong?idMonHoc=${idMonHocNumber}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data: Chuong[] = await res.json();
        setChuongList(data);
        console.log(data)
        // mặc định chọn chương đầu tiên
        if (data.length > 0) {
          setSelectedCategory(data[0].id.toString());
        }
      } catch (err) {
        console.error("Lỗi khi fetch chương:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchChuong();
  }, [idMonHocNumber]);
 
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

//Ds cauHoi
useEffect(() => {
  const fetchQuestions = async () => {
    if (!selectedCategory) return;
    try {
      const res = await fetch(`http://localhost:3000/chuong/${selectedCategory}/cau-hoi`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data: CauHoi[] = await res.json();
      const payloads: CauHoiPayload[] = data.map((cauHoi) => ({
        cauHoi,
        dapAn: [],
        mangFileDinhKem: [] 
      }));
      setQuestions(payloads);
    } catch (err) {
      console.error("Lỗi khi fetch câu hỏi:", err);
    }
  };
  fetchQuestions();
}, [selectedCategory]);

//xoa cau hoi
const handleDeleteQuestion = async () => {
  if (!questionToDelete) return;

  try {
    const res = await fetch(`http://localhost:3000/cau-hoi/${questionToDelete.id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

    // Cập nhật lại UI
    setQuestions(questions.filter((q) => q.cauHoi.id  !== questionToDelete.id));
    setOpenDeleteDialog(false);
    setQuestionToDelete(null);
    alert("Xóa thành công!");
  } catch (err) {
    console.error("Lỗi khi xóa câu hỏi:", err);
    alert("Xóa thất bại!");
  }
};

//nhap File
const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  if (event.target.files && event.target.files.length > 0) {
    setSelectedFile(event.target.files[0]);
  }
};

const handleUpload = async () => {
  if (!selectedFile) {
    alert("Vui lòng chọn file Excel trước!");
    return;
  }

  const formData = new FormData();
  formData.append("file", selectedFile);

  try {
    const res = await fetch(`http://localhost:3000/gui-file/cau-hoi/${selectedCategory}`, {
      method: "POST",
      body: formData,
    });
  
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
  
    alert("Upload thành công!");
  
    // Gọi lại API GET để lấy danh sách mới
    const refresh = await fetch(`http://localhost:3000/chuong/${selectedCategory}/cau-hoi`);
    const data: CauHoi[] = await refresh.json();
    const payloads: CauHoiPayload[] = data.map((cauHoi) => ({
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
                width: "33vw",
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
    },
  }}
  InputProps={{
    ...params.InputProps,
    startAdornment: (
      <SearchIcon sx={{ color: "#959595", mr: 1 }} />
    ),
  }}
/>
              )}
            />
           
          </Box>
        </Stack>

        {/* Header */}
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Box sx={{display:'flex', justifyContent:"center", alignItems:'center', flexDirection:'row'}}>
              <img src="/assets/QuestionBankIcon.png" 
              style={{height:"60px", width:"60px", borderRadius:100}}></img>
           
            <Typography variant="h3" sx={{ml:1, fontWeight: "medium", fontSize: "30px", color: "black" }}>
              Ngân hàng câu hỏi
            </Typography>
          </Box>
        </Stack>
      
        {/* Category List */}
        <Stack spacing={2}>
          <Box sx={{flexDirection: "row", display: "flex", alignItems: "center",justifyContent:"space-between" }}>
            <Box sx={{ flexDirection: "row", display: "flex", alignItems: "center" }}>
          <Typography sx={{fontWeight:'bold',fontSize:"18px"}}>
            Môn học:
          </Typography>
          <Box sx={{backgroundColor:"rgba(255, 0, 0, 0.04)", borderRadius:"10px", height:"30px", width:"180px", display:"flex", justifyContent:'center', alignItems:"center"}}>
          <Typography sx={{color:"rgba(255, 0, 0, 1)", ml:1, fontWeight:'bold',fontSize:"18px"}}>{tenMonHoc}</Typography>
          </Box>
          <Typography sx={{ml:1,fontWeight:'bold',fontSize:"18px"}}> → Ngân hàng câu hỏi</Typography>
          </Box>

          <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
            sx={{
              backgroundColor: "#408C56",
              height: "50px",
              borderRadius:"50px",
              width: "160px",
              fontSize: "16px",
              fontWeight: "bold",
              border:"1px black",
              color:"white",
              textTransform: "none",
              "&:hover": { backgroundColor: "#D9D9D9", color:'black' },
            }}
          >
            Thêm câu hỏi
          </Button>
          <Button
            variant="contained"
            onClick={() => fileInputRef.current?.click()}
            sx={{
              backgroundColor: "white",
              height: "50px",
              borderRadius:"50px",
              border:"1px black",
              width: "160px",
              fontSize: "16px",
              fontWeight: "bold",
              color:"black",
              "&:hover": { backgroundColor: "#D9D9D9" },
            }}
          >
             <img src="/assets/FileIcon.png" 
              style={{height:"30px", width:"30px"}}></img>
            Nhập File
            <input
   type="file"
   hidden
   accept=".xlsx,.xls"
   ref={fileInputRef}
   onChange={handleFileChange}
  />
          </Button>
          {selectedFile && (
  <Button
    variant="contained"
    color="primary"
    sx={{
      height: "50px",
      borderRadius: "50px",
      width: "160px",
      fontSize: "16px",
      fontWeight: "bold",
      textTransform: "none",
    }}
    onClick={handleUpload}
  >
    Tải lên
  </Button>
)}
          </Stack>
          </Box>
          <TextField
                select
                label="Chọn danh mục"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                       sx={{
                       ml:"70px",
                       width: 250,
                       backgroundColor: "white",
                       borderRadius:"10px",
                       "& .MuiOutlinedInput-root": {
                       height: "45px",
                       borderRadius:"10px",
                        },
                         }}
                       >
      {chuongList.map((chuong) => (
                <MenuItem key={chuong.id} value={chuong.id}>
                  {chuong.thuTu}. {chuong.tenChuong}
                </MenuItem>
              ))}
    </TextField>
          {questions.map((q, index) => (
            <Card  sx={{ borderRadius: "20px", height: "70px", boxShadow: "none", border:"none"  }}>

            
              <CardContent  sx={{ padding: 1.5, height: "50px", backgroundColor: "white" }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" height="100%">
                  {/* Left info */}
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography sx={{  fontSize: "20px", color: "black", fontWeight: "normal", width: 25, textAlign: "center" }}>
          
                    </Typography>
            
                    <Stack spacing={1} alignItems="flex-start">
                    <Box sx={{ flexDirection: "row", display: "flex", alignItems: "center" }}>
                    <Typography sx={{  fontSize: "20px", fontWeight: "bold", color: "black"}}>
                      Câu {index + 1}:
                      </Typography>
                      <Typography sx={{  fontSize: "20px", fontWeight: "medium", color: "black", ml:2}}>
                     {q.cauHoi.tenHienThi}
                      </Typography>
                     </Box>
                      {/* Info nằm cùng hàng */}
                     
                    </Stack>
                  </Stack>

                  {/* Right button */}
<Stack direction="row" spacing={1}>
  

  {/* Cập nhật */}
  <IconButton
      sx={{ color: "#0DC913" }}
  
      onClick={() => {
        setUpdateQuestionId(q.cauHoi.id);   // lưu id câu hỏi
        setOpenUpdateDialog(true);          // mở dialog update
      }}
  >
    <Edit />
  </IconButton>
<IconButton
  sx={{
    color:"#DB9C14"
  }}
  onClick={() => {
    if (q.cauHoi.id) {
      fetchQuestionDetail(q.cauHoi.id);
    }
  }}
>
  <Visibility />
</IconButton>
{/* Xóa */}
<IconButton
    sx={{
      color: "#d32f2f" 
    }}
    onClick={() => {
      setQuestionToDelete({id:q.cauHoi.id, name:q.cauHoi.tenHienThi});
      setOpenDeleteDialog(true);
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
      <CreateQuestionDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        idChuong={Number(selectedCategory)}
        onCreated={(payload: CauHoiPayload) => {
        setQuestions([payload, ...questions]); // payload.cauHoi mới đúng type CauHoi
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
  
    setQuestions((prev) =>
      prev.map((q) =>
        q.cauHoi.id === fullPayload.cauHoi.id ? fullPayload : q
      )
    );
  }}
  
  
/>



    </Box>
  );
};

export default BankQuestion;

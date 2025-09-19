import AddIcon from "@mui/icons-material/Add";
import { useParams,useLocation } from "react-router-dom";
import CategoryIcon from "@mui/icons-material/Category";
import SearchIcon from '@mui/icons-material/Search';
import { useEffect, useState, use } from "react";
import { Chuong,CauHoi,DapAn,CauHoiPayload } from "../../../common/model";
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
import CreateQuestionDialog from "./createQuestionDialog"
import QuestionDetailDialog from "./deTailDialog"
const BankQuestion = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);  //menu con
  const open = Boolean(anchorEl);

  const { idMonHoc } = useParams<{ idMonHoc: string }>();
  const [chuongList, setChuongList] = useState<Chuong[]>([]);

  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { tenMonHoc } = location.state || {};
  const idMonHocNumber = Number(idMonHoc);
  const [currentQuestion, setCurrentQuestion] = useState<CauHoiPayload | null>(null);

  //mở create-dialog
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [currentQuestionDetail, setCurrentQuestionDetail] = useState<CauHoiPayload | null>(null);

  const [questions, setQuestions] = useState<CauHoiPayload[]>([]);
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
        dapAn: [] // will be filled when user opens detail via GET /cau-hoi/:id
      }));
      setQuestions(payloads);
    } catch (err) {
      console.error("Lỗi khi fetch câu hỏi:", err);
    }
  };
  fetchQuestions();
}, [selectedCategory]);
  const handleCloseDialog = () =>{
    setOpenCreateDialog(false);
    setOpenUpdateDialog(false);
  }

  const handleClose = () => {
    setAnchorEl(null);
  };
 
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>, question: CauHoiPayload) => {
    setAnchorEl(event.currentTarget); // Vị trí nút bấm
    setCurrentQuestion(question); // Lưu câu hỏi hiện tại
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
              Ngân hàng câu hỏi
            </Typography>
            <TextField
                select
                label="Chọn danh mục"
              value={selectedCategory}
      onChange={(e) => setSelectedCategory(e.target.value)}
      sx={{
        mt: 2,
        width: 250,
        backgroundColor: "white",
        "& .MuiOutlinedInput-root": {
          height: "45px",
        },
      }}
    >
      {chuongList.map((chuong) => (
                <MenuItem key={chuong.id} value={chuong.id}>
                  {chuong.thuTu}. {chuong.tenChuong}
                </MenuItem>
              ))}
    </TextField>
          </Stack>


          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
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
       <Stack>
        
       </Stack>
        {/* Category List */}
        <Stack spacing={2}>
          <Box sx={{ flexDirection: "row", display: "flex", alignItems: "center" }}>
          <Typography sx={{fontWeight:'bold'}}>
            Môn học:
          </Typography>
          <Typography sx={{color:"#245d51", ml:1, fontWeight:'bold'}}>{tenMonHoc}</Typography>
          </Box>
          {questions.map((q, index) => (
            <Card  sx={{ borderRadius: "20px", height: "95px", boxShadow: "none", border:"1px solid #A8A8A8"  }}>

            
              <CardContent  sx={{ padding: 2, height: "70px", backgroundColor: "white" }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" height="100%">
                  {/* Left info */}
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography sx={{  fontSize: "20px", color: "black", fontWeight: "normal", width: 25, textAlign: "center" }}>
          
                    </Typography>
            
                    <Box sx={{ width: "1px", height: "70px", backgroundColor: "#A8A8A8" }} />

                    <Stack spacing={1} alignItems="flex-start">
                      <Typography sx={{  fontSize: "20px", fontWeight: "medium", color: "black"}}>
                      Câu {index + 1}: {q.cauHoi.noiDungCauHoi}
                      </Typography>

                      {/* Info nằm cùng hàng */}
                      <Stack direction="row" spacing={4} justifyContent="center">
                        <Typography sx={{ fontFamily: "Poppins", fontSize: "14px", color: "#a5a5a5", textAlign: "center" }}>
                          Ngày tạo: {q.cauHoi.create_at}
                        </Typography>
                        <Typography sx={{ fontFamily: "Poppins", fontSize: "14px", color: "#a5a5a5", textAlign: "center" }}>
                          Ngày cập nhật: {q.cauHoi.update_at}
                        </Typography>
                        <Typography sx={{ fontFamily: "Poppins", fontSize: "14px", color: "#a5a5a5", textAlign: "center" }}>
                          Loại câu hỏi: {LOAI_CAU_HOI_MAP[q.cauHoi.loaiCauHoi] || q.cauHoi.loaiCauHoi}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>

                  {/* Right button */}
                  <Button
  variant="contained"
  sx={{
    backgroundColor: "#245d51",
    borderRadius: "10px",
    height: "50px",
    width: "150px",
    fontSize: "16px",
    fontWeight: "medium",
    textTransform: "none",
    boxShadow:'none',

    "&:hover": { backgroundColor: "#1a4a3e" },
  }}
  onClick={(e) => handleClick(e, q)}
>
  Actions
  <img src="/assets/ArrowDown.png" alt="icon" 
   style={{ width: "25px", height: "25px",marginLeft: "8px" }} />

</Button>
<Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
            PaperProps={{ sx: { borderRadius: "12px", backgroundColor: "#fff", boxShadow: "0px 4px 20px rgba(0,0,0,0.1)", mt: 1 } }}
          >
            <MenuItem sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}
              onClick={() => { handleClose(); /* TODO: delete handler */ }}>
              Xóa
            </MenuItem>

            <MenuItem sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}
              onClick={() => { handleClose(); /* TODO: update handler */ }}>
              Cập nhật
            </MenuItem>

            <MenuItem sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}
              onClick={() => {
                handleClose();
                // fetch full payload (cauHoi + dapAn) by id
                if (currentQuestion?.cauHoi?.id) {
                  fetchQuestionDetail(currentQuestion.cauHoi.id);
                }
              }}
            >
              Xem chi tiết
            </MenuItem>
          </Menu>

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







    </Box>
  );
};

export default BankQuestion;

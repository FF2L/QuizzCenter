
import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Container,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Stack,
  Checkbox,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";
import { CauHoiPayload } from "../../../common/model";
import Quill from "quill";
import './quill.css';

interface DapAnInput {
  noiDung: string;
  dapAnDung: boolean;
}

const LOAI_CAU_HOI = [
  { value: "MotDung", label: "Một đáp án" },
  { value: "NhieuDung", label: "Nhiều đáp án" },
];

const DO_KHO = [
  { value: "De", label: "Dễ" },
  { value: "Kho", label: "Khó" },
];

export default function CreateQuestionPage() {

  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    idChuong?: number;
    idMonHoc?: string | number;
    returnPath?: string;
    tenMonHoc?: string;
    tenChuong?:string;
    returnTab?:string;
  };
  
console.log("STATE CREATE QUESTION:", state); // ✅ debug xem có tenChuong chưa
const idChuongFromState = state?.idChuong;

const idChuongFromQuery = Number(new URLSearchParams(location.search).get("idChuong"));

// idChuong cuối cùng
const idChuong = Number(idChuongFromState ?? (isNaN(idChuongFromQuery) ? 0 : idChuongFromQuery));
const idMonHoc = state?.idMonHoc ? Number(state.idMonHoc) : undefined;
const returnPath = state?.returnPath;
const { tenMonHoc } = location.state || {};
const { tenChuong } = location.state || {};
  const [tenHienThi, setTenHienThi] = useState("");
  const [noiDungCauHoi, setNoiDungCauHoi] = useState("");
  const [loaiCauHoi, setLoaiCauHoi] = useState("MotDung");
  const [doKho, setDoKho] = useState("De");
  const [dapAns, setDapAns] = useState<DapAnInput[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [errorAnswers, setErrorAnswers] = useState<(string | null)[]>([]);
  const quillRef = useRef<ReactQuill | null>(null);

  
  const handleBack = () => {
    navigate("/page/" + state?.idMonHoc, { state: {
      idMonHoc: state?.idMonHoc,
      tenMonHoc: state?.tenMonHoc, 
      tenChuong:state?.tenChuong,
      idChuong: state?.idChuong  , tab: 2 } });
  };
  // Image handler (giữ nguyên logic từ dialog)
  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result;
        if (!base64) return;

        const editor = quillRef.current?.getEditor();
        if (!editor) return;

        const range = editor.getSelection();
        const insertIndex = range ? range.index : editor.getLength();

        setFiles((prev) => {
          const newFiles = [...prev, file];
          const currentFileIndex = newFiles.length - 1;

          editor.insertEmbed(insertIndex, "image", base64, "user");

          const imgs = editor.root.querySelectorAll("img");
          const lastImg = imgs[imgs.length - 1] as HTMLImageElement;
          if (lastImg) lastImg.setAttribute("data-file-index", currentFileIndex.toString());

          return newFiles;
        });
      };

      reader.readAsDataURL(file);
    };
  }, []);
 
  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ size: [] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["link", "image"],
        ["clean"],
      ],
      handlers: {
        image: imageHandler,
      },
    },
  }), [imageHandler]);

  const handleQuillChange = (content: string) => setNoiDungCauHoi(content);

  const handleAddAnswer = () => setDapAns((prev) => [...prev, { noiDung: "", dapAnDung: false }]);

  const handleChangeAnswer = (index: number, value: string) => {
    const trimmedValue = value.trim();
    const isDuplicate = dapAns.some((d, i) => i !== index && d.noiDung.trim() === trimmedValue);

    setErrorAnswers((prev) => {
      const copy = [...prev];
      copy[index] = isDuplicate ? "Đáp án trùng với đáp án khác!" : null;
      return copy;
    });

    setDapAns((prev) => {
      const copy = [...prev];
      copy[index].noiDung = value;
      return copy;
    });
  };

  const handleToggleCorrect = (index: number) => {
    setDapAns((prev) =>
      prev.map((d, i) => ({
        ...d,
        dapAnDung:
          loaiCauHoi === "MotDung"
            ? i === index
            : i === index
            ? !d.dapAnDung
            : d.dapAnDung,
      }))
    );
  };

  const handleSave = async () => {
    if (!noiDungCauHoi || noiDungCauHoi === "<p><br></p>") {
      alert("Nội dung câu hỏi không được để trống!");
      return;
    }

    if (dapAns.length < 1) {
      alert("Phải có ít nhất 1 đáp án!");
      return;
    }

    const numCorrect = dapAns.filter((d) => d.dapAnDung).length;
    if (numCorrect === 0) {
      alert("Phải có ít nhất 1 đáp án đúng!");
      return;
    }
    if (loaiCauHoi === "MotDung" && numCorrect > 1) {
      alert("Câu hỏi một đáp án chỉ được chọn 1 đáp án đúng!");
      return;
    }

    const createCauHoi = {
      tenHienThi: tenHienThi.trim(),
      noiDungCauHoi: noiDungCauHoi.replace(/<[^>]+>/g, ""),
      noiDungCauHoiHTML: noiDungCauHoi,
      loaiCauHoi,
      doKho,
      idChuong,
      mangDapAn: dapAns.map((d) => ({
        noiDung: d.noiDung.trim(),
        noiDungHTML: d.noiDung,
        dapAnDung: d.dapAnDung,
      })),
    };

    try {
      const editor = quillRef.current?.getEditor();
      if (!editor) throw new Error("Editor chưa khởi tạo");

      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));

      const tempHTML = editor.root.innerHTML.replace(/(<img [^>]*?)src="data:image[^"]+"/g, '$1src="//:0"');
      const createCauHoiTemp = { ...createCauHoi, noiDungCauHoiHTML: tempHTML };
      formData.append("createCauHoi", JSON.stringify(createCauHoiTemp));

      const res = await fetch("http://localhost:3000/cau-hoi", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const data: CauHoiPayload = await res.json();

      // map ảnh backend trả về vào editor
      if (editor && data.mangFileDinhKem) {
        data.mangFileDinhKem.forEach((f: any, idx: number) => {
          const imgs = editor.root.querySelectorAll(`img[data-file-index="${idx}"]`);
          imgs.forEach((imgEl: Element) => {
            const img = imgEl as HTMLImageElement;
            img.src = f.duongDan || f.url || f.path || f.fileUrl || "";
            img.style.width = "100%";
            img.style.height = "auto";
          });
        });

        setNoiDungCauHoi(editor.root.innerHTML);
        createCauHoi.noiDungCauHoiHTML = editor.root.innerHTML;
      }

      alert("Thêm câu hỏi thành công!");

      // navigate về returnPath (nếu có) và đẩy createdQuestion qua location.state
      navigate("/page/" + idMonHoc, {
        state: { 
          createdQuestion: data,
          tenMonHoc,
          tab: 2 ,
          idChuong,
          tenChuong,
        }
      });

      // reset form
      setTenHienThi("");
      setNoiDungCauHoi("");
      setLoaiCauHoi("MotDung");
      setDoKho("De");
      setDapAns([]);
      setFiles([]);
    } catch (err: any) {
      console.error(err);
      alert("Thêm câu hỏi thất bại: " + err.message);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <IconButton onClick={handleBack}>
  <ArrowBackIcon />
</IconButton>
          <Typography variant="h5">Tạo câu hỏi</Typography>
        </Box>
      </Box>
       
      <Box sx={{ backgroundColor: "white", p: 3, borderRadius: 2 }}>
        <Stack spacing={2}>
        <Box>
       <Box sx={{ flexDirection: "row", display: "flex", alignItems: "center" }}>
          <Typography sx={{fontWeight:'bold',fontSize:"18px"}}>
            Môn học:
          </Typography>
          <Box sx={{backgroundColor:"rgba(255, 0, 0, 0.04)", borderRadius:"10px", height:"30px", width:"180px", display:"flex", justifyContent:'center', alignItems:"center"}}>
          <Typography sx={{color:"rgba(255, 0, 0, 1)", ml:1, fontWeight:'bold',fontSize:"18px"}}>{tenMonHoc}</Typography>
          </Box>
          <Typography sx={{ml:1,fontWeight:'bold',fontSize:"18px"}}> → Ngân hàng câu hỏi</Typography>
          <Typography sx={{ ml: 1, fontWeight: 'bold', fontSize: "18px" }}>
              → Tạo câu hỏi (
                            <span style={{ color: "#007CD5" }}>{tenChuong}</span>
                             )
</Typography>

         
          </Box>
       </Box>
          <Box>
            <Typography>Tên hiển thị</Typography>
            <TextField
              label="Tên hiển thị"
              fullWidth
              value={tenHienThi}
              onChange={(e) => setTenHienThi(e.target.value)}
            />
          </Box>

          <Box className="quill-editor-container" sx={{ minHeight: 200 }}>
  <Typography>Nội dung câu hỏi</Typography>
  <ReactQuill
    ref={quillRef}
    value={noiDungCauHoi}
    onChange={handleQuillChange}
    modules={quillModules}
    theme="snow"
    placeholder="Nhập nội dung câu hỏi..."
  />
</Box>

          <TextField select label="Loại câu hỏi" value={loaiCauHoi} onChange={(e) => setLoaiCauHoi(e.target.value)}>
            {LOAI_CAU_HOI.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>

          <TextField select label="Độ khó" value={doKho} onChange={(e) => setDoKho(e.target.value)}>
            {DO_KHO.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>

          <Typography fontWeight="bold">Danh sách đáp án:</Typography>
          <Stack spacing={1}>
            {dapAns.map((d, index) => (
              <Box key={index} sx={{ mb: 1, border: "1px solid #ddd", borderRadius: 1, p: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Checkbox checked={d.dapAnDung} onChange={() => handleToggleCorrect(index)} />
                  <Box sx={{ flex: 1 }}>
                    <ReactQuill
                      value={d.noiDung}
                      onChange={(value) => handleChangeAnswer(index, value)}
                      modules={quillModules}
                      theme="snow"
                      placeholder={`Đáp án ${index + 1}`}
                    />
                    {errorAnswers[index] && (
                      <Typography color="error" fontSize={12} mt={0.5}>
                        {errorAnswers[index]}
                      </Typography>
                    )}
                  </Box>

                  <IconButton onClick={() => setDapAns((prev) => prev.filter((_, i) => i !== index))} size="small">
                    <CloseIcon />
                  </IconButton>
                </Stack>
              </Box>
            ))}

            <Button startIcon={<AddIcon />} onClick={handleAddAnswer} sx={{ alignSelf: "flex-start" }}>
              Thêm đáp án
            </Button>
          </Stack>
        </Stack>
      </Box>

      <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 2 }}>
      <Button onClick={() => navigate("/page/" + idMonHoc, { state: { tab: 2, idChuong, tenMonHoc,tenChuong } })}>
  Hủy
</Button>

        <Button sx={{backgroundColor:"#245D51", color:"white"}} onClick={handleSave}>Tạo</Button>
      </Box>
    </Container>
  );
}


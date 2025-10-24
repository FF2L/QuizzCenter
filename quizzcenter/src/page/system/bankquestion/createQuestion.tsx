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
  Snackbar,
  Alert,
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
    tenChuong?: string;
    returnTab?: string;
  };

  console.log("STATE CREATE QUESTION:", state);

  const idChuongFromState = state?.idChuong;
  const idChuongFromQuery = Number(
    new URLSearchParams(location.search).get("idChuong")
  );
  const idChuong = Number(idChuongFromState ?? (isNaN(idChuongFromQuery) ? 0 : idChuongFromQuery));
  const idMonHoc = state?.idMonHoc ? Number(state.idMonHoc) : undefined;
  const returnPath = state?.returnPath;
  const { tenMonHoc, tenChuong } = location.state || {};

  const [tenHienThi, setTenHienThi] = useState("");
  const [noiDungCauHoi, setNoiDungCauHoi] = useState("");
  const [loaiCauHoi, setLoaiCauHoi] = useState("MotDung");
  const [doKho, setDoKho] = useState("De");
  const [dapAns, setDapAns] = useState<DapAnInput[]>([
    { noiDung: "", dapAnDung: false },
    { noiDung: "", dapAnDung: false },
    { noiDung: "", dapAnDung: false },
    { noiDung: "", dapAnDung: false },
  ]);
  const [files, setFiles] = useState<File[]>([]);
  const [errorAnswers, setErrorAnswers] = useState<(string | null)[]>([null, null, null, null]);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error" as "error" | "warning" | "info" | "success",
  });

  const quillRef = useRef<ReactQuill | null>(null);
  const answerRefs = useRef<(ReactQuill | null)[]>([]);
  const quillModulesRefs = useRef<{ [key: number]: any }>({});

  const handleBack = () => {
    navigate("/lecturer/course/" + state?.idMonHoc, {
      state: {
        idMonHoc: state?.idMonHoc,
        tenMonHoc: state?.tenMonHoc,
        tenChuong: state?.tenChuong,
        idChuong: state?.idChuong,
        tab: 1,
      },
    });
  };

  const showSnackbar = (message: string, severity: "error" | "warning" | "info" | "success" = "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Lấy modules của 1 editor
  const getQuillModulesMemo = (index: number) => {
    if (!quillModulesRefs.current[index]) {
      quillModulesRefs.current[index] = {
        toolbar: {
          container: [
            [{ size: [] }],
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ align: [] }],
            ["link", "image"],
            ["clean"],
          ],
          handlers: { image: getImageHandler(index) },
        },
      };
    }
    return quillModulesRefs.current[index];
  };

  const handleQuillChange = (content: string) => setNoiDungCauHoi(content);

  const handleAddAnswer = () => {
    setDapAns((prev) => [...prev, { noiDung: "", dapAnDung: false }]);
    setErrorAnswers((prev) => [...prev, null]);
  };

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
      prev.map((d, i) => {
        if (loaiCauHoi === "MotDung") {
          // Nếu bấm vào đáp án đang được chọn → bỏ chọn
          if (i === index && d.dapAnDung) {
            return { ...d, dapAnDung: false };
          }
          // Nếu bấm vào đáp án khác → chỉ chọn 1
          return { ...d, dapAnDung: i === index };
        } else {
          // Nếu nhiều đáp án → toggle bình thường
          return i === index ? { ...d, dapAnDung: !d.dapAnDung } : d;
        }
      })
    );
  };
  

  const handleDeleteAnswer = (index: number) => {
    setDapAns((prev) => prev.filter((_, i) => i !== index));
    setErrorAnswers((prev) => prev.filter((_, i) => i !== index));
    answerRefs.current = answerRefs.current.filter((_, i) => i !== index);
  };

  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
  
    const res = await fetch("http://localhost:3000/gui-file/anh", {
      method: "POST",
      body: formData,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Upload ảnh thất bại: ${text}`);
    }
    const data = await res.json();
    return data.publicId.url;
  }

  function stripHtml(html: string) {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  }

  const getImageHandler = (index: number) => () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();
  
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) {
        showSnackbar("Bạn chưa chọn file!", "warning");
        return;
      }
  
      try {
        const formData = new FormData();
        formData.append("file", file);
  
        const res = await fetch("http://localhost:3000/gui-file/anh", {
          method: "POST",
          body: formData,
        });
  
        if (!res.ok) {
          const text = await res.text();
          throw new Error("Upload ảnh thất bại: " + text);
        }
  
        const data = await res.json();
        const url = data.publicId.url;
  
        const editor =
          index === -1
            ? quillRef.current?.getEditor()
            : answerRefs.current[index]?.getEditor();
        if (!editor) return;
  
        const range = editor.getSelection();
        const insertIndex = range ? range.index : editor.getLength();
        editor.insertEmbed(insertIndex, "image", url, "user");
      } catch (err: any) {
        showSnackbar(err.message, "error");
      }
    };
  };
  
  const handleSave = async () => {
    // Validation 1: Kiểm tra nội dung câu hỏi
    if (!noiDungCauHoi || noiDungCauHoi === "<p><br></p>") {
      showSnackbar("Nội dung câu hỏi không được để trống!", "error");
      return;
    }

    // Validation 2: Kiểm tra số lượng đáp án
    if (dapAns.length < 1) {
      showSnackbar("Phải có ít nhất 1 đáp án!", "error");
      return;
    }

    // Validation 3: Kiểm tra đáp án trống
    const hasEmptyAnswer = dapAns.some((d) => !d.noiDung || d.noiDung.trim() === "" || d.noiDung === "<p><br></p>");
    if (hasEmptyAnswer) {
      showSnackbar("Vui lòng điền đầy đủ nội dung cho tất cả các đáp án!", "error");
      return;
    }

    // Validation 4: Kiểm tra đáp án trùng lặp
    const trimmedAnswers = dapAns.map((d) => stripHtml(d.noiDung).trim());
    const hasDuplicates = trimmedAnswers.some((answer, index) => 
      trimmedAnswers.indexOf(answer) !== index && answer !== ""
    );
    if (hasDuplicates) {
      showSnackbar("Có đáp án bị trùng lặp! Vui lòng kiểm tra lại.", "error");
      return;
    }

    // Validation 5: Kiểm tra đáp án đúng
    const numCorrect = dapAns.filter((d) => d.dapAnDung).length;
    if (numCorrect === 0) {
      showSnackbar("Phải có ít nhất 1 đáp án đúng!", "error");
      return;
    }

    // Validation 6: Kiểm tra loại câu hỏi một đáp án
    if (loaiCauHoi === "MotDung" && numCorrect > 1) {
      showSnackbar("Câu hỏi một đáp án chỉ được chọn 1 đáp án đúng!", "error");
      return;
    }
  
    try {
      const accessToken = localStorage.getItem("accessToken") || "";
  
      const editorQuestion = quillRef.current?.getEditor();
      if (!editorQuestion) throw new Error("Editor câu hỏi chưa khởi tạo");
      const noiDungCauHoiHTML = editorQuestion.root.innerHTML;
  
      const mangDapAn = dapAns.map((d, i) => ({
        noiDung: stripHtml(answerRefs.current[i]?.getEditor().root.innerHTML || ""),
        noiDungHTML: answerRefs.current[i]?.getEditor().root.innerHTML || "",
        dapAnDung: d.dapAnDung,
      }));
  
      const payload = {
        tenHienThi: tenHienThi.trim(),
        noiDungCauHoi: stripHtml(noiDungCauHoiHTML),
        noiDungCauHoiHTML,
        loaiCauHoi,
        doKho,
        idChuong,
        mangDapAn,
      };
  
      const res = await fetch("http://localhost:3000/cau-hoi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });
  
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Tạo câu hỏi thất bại: ${text}`);
      }
  
      showSnackbar("Thêm câu hỏi thành công!", "success");
      
      // Đợi 1s để user nhìn thấy thông báo trước khi chuyển trang
      setTimeout(() => {
        navigate("/lecturer/course/" + idMonHoc, {
          state: { tab: 1, idChuong, tenMonHoc, tenChuong },
        });
      }, 1000);
  
      setTenHienThi("");
      setNoiDungCauHoi("");
      setLoaiCauHoi("MotDung");
      setDoKho("De");
      setDapAns([
        { noiDung: "", dapAnDung: false },
        { noiDung: "", dapAnDung: false },
        { noiDung: "", dapAnDung: false },
        { noiDung: "", dapAnDung: false },
      ]);
      setErrorAnswers([null, null, null, null]);
    } catch (err: any) {
      showSnackbar(err.message, "error");
    }
  };

  return (
    <Container sx={{ py: 4, backgroundColor: '#F8F9FA', width: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <IconButton onClick={handleBack}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h5">Tạo câu hỏi</Typography>
        </Box>
      </Box>

      <Box sx={{ backgroundColor: "white", p: 3, borderRadius: 2 }}>
        <Stack spacing={3}>
          {/* Breadcrumb */}
          <Box>
            <Box sx={{ flexDirection: "row", display: "flex", alignItems: "center" }}>
              <Typography sx={{ fontWeight: 'bold', fontSize: "18px" }}> Môn học: </Typography>
              <Box sx={{
                backgroundColor: "rgba(255, 0, 0, 0.04)",
                borderRadius: "10px",
                height: "30px",
                width: "180px",
                display: "flex",
                justifyContent: 'center',
                alignItems: "center",
                ml: 1
              }}>
                <Typography sx={{ color: "rgba(255, 0, 0, 1)", fontWeight: 'bold', fontSize: "18px" }}>
                  {tenMonHoc}
                </Typography>
              </Box>
              <Typography sx={{ ml: 1, fontWeight: 'bold', fontSize: "18px" }}> → Ngân hàng câu hỏi</Typography>
              <Typography sx={{ ml: 1, fontWeight: 'bold', fontSize: "18px" }}>
                → Tạo câu hỏi ( <span style={{ color: "#007CD5" }}>{tenChuong}</span> )
              </Typography>
            </Box>
          </Box>

          {/* Tên hiển thị */}
          <Box>
            <TextField 
              label="Tên hiển thị" 
              fullWidth 
              value={tenHienThi} 
              onChange={(e) => setTenHienThi(e.target.value)} 
            />
          </Box>

          {/* Nội dung câu hỏi */}
          <Box className="quill-editor-question-container">
            <Typography sx={{ mb: 1, fontWeight: 500 }}>Nội dung câu hỏi</Typography>
            <ReactQuill
              style={{ height: "30vh", marginBottom: "50px" }}
              ref={quillRef}
              value={noiDungCauHoi}
              onChange={handleQuillChange}
              modules={getQuillModulesMemo(-1)}
              theme="snow"
              placeholder="Nhập nội dung câu hỏi..."
            />               
          </Box>

          {/* Loại câu hỏi */}
          <Box>
            <TextField 
              select 
              label="Loại câu hỏi" 
              fullWidth
              value={loaiCauHoi} 
              onChange={(e) => setLoaiCauHoi(e.target.value)}
            >
              {LOAI_CAU_HOI.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Độ khó */}
          <Box>
            <TextField 
              select 
              label="Độ khó" 
              fullWidth
              value={doKho} 
              onChange={(e) => setDoKho(e.target.value)}
            >
              {DO_KHO.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Danh sách đáp án */}
          <Box>
            <Typography fontWeight="bold" sx={{ mb: 2 }}>Danh sách đáp án:</Typography>
            <Stack spacing={2}>
              {dapAns.map((d, index) => (
                <Box key={index} sx={{ border: "1px solid #ddd", borderRadius: 1, p: 2 }}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <Checkbox 
                      checked={d.dapAnDung} 
                      onChange={() => handleToggleCorrect(index)}
                      sx={{ mt: 1 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <ReactQuill
                        className="quill-editor-answer-container"
                        key={index}
                        ref={(el) => { answerRefs.current[index] = el; }}
                        value={d.noiDung}
                        onChange={(value) => handleChangeAnswer(index, value)}
                        modules={getQuillModulesMemo(index)}
                        theme="snow"
                        placeholder={`Đáp án ${index + 1}`}
                      />
                      {errorAnswers[index] && (
                        <Typography color="error" fontSize={12} mt={1}>
                          {errorAnswers[index]}
                        </Typography>
                      )}
                    </Box>
                    <IconButton 
                      onClick={() => handleDeleteAnswer(index)} 
                      size="small"
                      sx={{ mt: 1 }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Stack>
                </Box>
              ))}
              <Button 
                startIcon={<AddIcon />} 
                onClick={handleAddAnswer} 
                sx={{ alignSelf: "flex-start", color: "#245D51" }}
              >
                Thêm đáp án
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Box>

      {/* Buttons */}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button
          color="secondary"
          variant="outlined"
          onClick={() =>
            navigate("/page/" + idMonHoc, { state: { tab: 2, idChuong, tenMonHoc, tenChuong } })
          }
        >
          Hủy
        </Button>
        <Button sx={{ backgroundColor: "#245D51", color: "white" }} onClick={handleSave}>
          Tạo
        </Button>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
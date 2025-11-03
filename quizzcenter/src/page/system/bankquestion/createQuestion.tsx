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
  Paper,
  Divider,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import "react-quill/dist/quill.snow.css";
import ReactQuill, { Quill } from "react-quill";
import ImageResize from "quill-image-resize-module-react";
import { CauHoiPayload } from "../../../common/model";
import './quill.css';

// Đăng ký module resize ảnh
Quill.register("modules/imageResize", ImageResize);

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
  { value: "TrungBinh", label: "Trung bình" },
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

  const idChuongFromState = state?.idChuong;
  const idChuongFromQuery = Number(
    new URLSearchParams(location.search).get("idChuong")
  );
  const idChuong = Number(idChuongFromState ?? (isNaN(idChuongFromQuery) ? 0 : idChuongFromQuery));
  const idMonHoc = state?.idMonHoc ? Number(state.idMonHoc) : undefined;
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
  const [errorAnswers, setErrorAnswers] = useState<(string | null)[]>([null, null, null, null]);
  
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
        imageResize: {
          parchment: Quill.import("parchment"),
          modules: ["Resize", "DisplaySize", "Toolbar"],
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
          if (i === index && d.dapAnDung) {
            return { ...d, dapAnDung: false };
          }
          return { ...d, dapAnDung: i === index };
        } else {
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
  
      // Kiểm tra kích thước file (giới hạn 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showSnackbar("Kích thước ảnh không được vượt quá 5MB!", "error");
        return;
      }
  
      // Hiển thị thông báo đang tải
      showSnackbar("Đang tải hình ảnh...", "info");
  
      try {
        // Lấy editor và vị trí cursor NGAY LẬP TỨC
        const editor =
          index === -1
            ? quillRef.current?.getEditor()
            : answerRefs.current[index]?.getEditor();
        
        if (!editor) {
          showSnackbar("Editor chưa sẵn sàng!", "error");
          return;
        }
  
        const range = editor.getSelection(true);
        const cursorPosition = range ? range.index : editor.getLength();
  
        // Upload file
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
        const imageUrl = data.publicId.url;
  
        // Insert ảnh NGAY LẬP TỨC tại vị trí cursor đã lưu
        editor.insertEmbed(cursorPosition, "image", imageUrl, "user");
        
        // Di chuyển cursor xuống dưới ảnh
        editor.setSelection(cursorPosition + 1, 0);
        
        // Focus vào editor
        editor.focus();

        // Thông báo thành công
        showSnackbar("Tải hình ảnh thành công!", "success");
  
      } catch (err: any) {
        showSnackbar(err.message || "Upload ảnh thất bại!", "error");
      }
    };
  };

  const handleSave = async () => {
    if (!noiDungCauHoi || noiDungCauHoi === "<p><br></p>") {
      showSnackbar("Nội dung câu hỏi không được để trống!", "error");
      return;
    }

    if (dapAns.length < 1) {
      showSnackbar("Phải có ít nhất 1 đáp án!", "error");
      return;
    }

    const hasEmptyAnswer = dapAns.some((d) => !d.noiDung || d.noiDung.trim() === "" || d.noiDung === "<p><br></p>");
    if (hasEmptyAnswer) {
      showSnackbar("Vui lòng điền đầy đủ nội dung cho tất cả các đáp án!", "error");
      return;
    }

    const trimmedAnswers = dapAns.map((d) => stripHtml(d.noiDung).trim());
    const hasDuplicates = trimmedAnswers.some((answer, index) => 
      trimmedAnswers.indexOf(answer) !== index && answer !== ""
    );
    if (hasDuplicates) {
      showSnackbar("Có đáp án bị trùng lặp! Vui lòng kiểm tra lại.", "error");
      return;
    }

    const numCorrect = dapAns.filter((d) => d.dapAnDung).length;
    if (numCorrect === 0) {
      showSnackbar("Phải có ít nhất 1 đáp án đúng!", "error");
      return;
    }

    if (loaiCauHoi === "MotDung" && numCorrect > 1) {
      showSnackbar("Câu hỏi một đáp án chỉ được chọn 1 đáp án đúng!", "error");
      return;
    }

    try {
      const accessToken = localStorage.getItem("accessTokenGV") || "";

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
    <Box sx={{ minHeight: "100vh", backgroundColor: '#f5f7fa', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 2, backgroundColor: 'white' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton 
              onClick={handleBack}
              sx={{ 
                backgroundColor: '#f5f5f5',
                '&:hover': { backgroundColor: '#e0e0e0' }
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight="bold" color="#1a1a1a">
                Tạo câu hỏi mới
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                <Typography variant="body2" color="text.secondary">
                  {tenMonHoc}
                </Typography>
                <Typography variant="body2" color="text.secondary">•</Typography>
                <Typography variant="body2" color="text.secondary">
                  Ngân hàng câu hỏi
                </Typography>
                <Typography variant="body2" color="text.secondary">•</Typography>
                <Chip 
                  label={tenChuong} 
                  size="small" 
                  sx={{ 
                    backgroundColor: '#e3f2fd',
                    color: '#1976d2',
                    fontWeight: 500
                  }}
                />
              </Stack>
            </Box>
          </Stack>
        </Paper>

        {/* Main Content */}
        <Paper elevation={0} sx={{ p: 4, borderRadius: 2, backgroundColor: 'white' }}>
          <Stack spacing={4}>
            {/* Tên hiển thị */}
            <Box>
              <Typography variant="subtitle1" fontWeight="600" mb={1.5} color="#1a1a1a">
                Tên hiển thị *
              </Typography>
              <TextField 
                fullWidth 
                value={tenHienThi} 
                onChange={(e) => setTenHienThi(e.target.value)}
                placeholder="Nhập tên hiển thị cho câu hỏi..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#fafafa',
                    '&:hover': {
                      backgroundColor: '#f5f5f5',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                    }
                  }
                }}
              />
            </Box>

            <Divider />

            {/* Nội dung câu hỏi */}
            <Box>
              <Typography variant="subtitle1" fontWeight="600" mb={1.5} color="#1a1a1a">
                Nội dung câu hỏi *
              </Typography>
              <Box 
                className="quill-editor-question-container"
                sx={{
                  '& .ql-container': {
                    minHeight: '250px',
                    fontSize: '15px',
                    backgroundColor: '#fafafa',
                  },
                  '& .ql-editor': {
                    minHeight: '250px',
                  },
                  '& .ql-toolbar': {
                    backgroundColor: 'white',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px',
                  }
                }}
              >
                <ReactQuill
                  ref={quillRef}
                  value={noiDungCauHoi}
                  onChange={handleQuillChange}
                  modules={getQuillModulesMemo(-1)}
                  theme="snow"
                  placeholder="Nhập nội dung câu hỏi..."
                />
              </Box>
            </Box>

            <Divider />

            {/* Loại câu hỏi và Độ khó */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <Box flex={1}>
                <Typography variant="subtitle1" fontWeight="600" mb={1.5} color="#1a1a1a">
                  Loại câu hỏi *
                </Typography>
                <TextField 
                  select 
                  fullWidth
                  value={loaiCauHoi} 
                  onChange={(e) => setLoaiCauHoi(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fafafa',
                    }
                  }}
                >
                  {LOAI_CAU_HOI.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box flex={1}>
                <Typography variant="subtitle1" fontWeight="600" mb={1.5} color="#1a1a1a">
                  Độ khó *
                </Typography>
                <TextField 
                  select 
                  fullWidth
                  value={doKho} 
                  onChange={(e) => setDoKho(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fafafa',
                    }
                  }}
                >
                  {DO_KHO.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </TextField>
              </Box>
            </Stack>

            <Divider />

            {/* Danh sách đáp án */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" fontWeight="600" color="#1a1a1a">
                  Danh sách đáp án *
                </Typography>
                <Chip 
                  label={`${dapAns.filter(d => d.dapAnDung).length} đáp án đúng`}
                  size="small"
                  color={dapAns.filter(d => d.dapAnDung).length > 0 ? "success" : "default"}
                  icon={dapAns.filter(d => d.dapAnDung).length > 0 ? <CheckCircleIcon /> : undefined}
                />
              </Stack>

              <Stack spacing={2.5}>
                {dapAns.map((d, index) => (
                  <Paper 
                    key={index} 
                    elevation={0}
                    sx={{ 
                      border: d.dapAnDung ? '2px solid #4caf50' : '1px solid #e0e0e0',
                      borderRadius: 2,
                      p: 2.5,
                      backgroundColor: d.dapAnDung ? '#f1f8f4' : '#fafafa',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      }
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <Box sx={{ pt: 0.5 }}>
                        <Checkbox 
                          checked={d.dapAnDung} 
                          onChange={() => handleToggleCorrect(index)}
                          sx={{
                            color: '#9e9e9e',
                            '&.Mui-checked': {
                              color: '#4caf50',
                            }
                          }}
                        />
                      </Box>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary" mb={1} display="block">
                          Đáp án {index + 1}
                        </Typography>
                        <Box
                          className="quill-editor-answer-container"
                          sx={{
                            '& .ql-container': {
                              minHeight: '80px',
                              fontSize: '14px',
                              backgroundColor: 'white',
                            },
                            '& .ql-editor': {
                              minHeight: '80px',
                            },
                            '& .ql-toolbar': {
                              backgroundColor: 'white',
                            }
                          }}
                        >
                          <ReactQuill
                            ref={(el) => { answerRefs.current[index] = el; }}
                            value={d.noiDung}
                            onChange={(value) => handleChangeAnswer(index, value)}
                            modules={getQuillModulesMemo(index)}
                            theme="snow"
                            placeholder={`Nhập nội dung đáp án ${index + 1}...`}
                          />
                        </Box>
                        {errorAnswers[index] && (
                          <Alert severity="error" sx={{ mt: 1 }}>
                            {errorAnswers[index]}
                          </Alert>
                        )}
                      </Box>

                      <IconButton 
                        onClick={() => handleDeleteAnswer(index)} 
                        size="small"
                        sx={{ 
                          mt: 3,
                          color: '#f44336',
                          '&:hover': {
                            backgroundColor: '#ffebee',
                          }
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Stack>
                  </Paper>
                ))}

                <Button 
                  startIcon={<AddIcon />} 
                  onClick={handleAddAnswer}
                  variant="outlined"
                  sx={{ 
                    alignSelf: 'flex-start',
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    color: '#245D51',
                    borderColor: '#245D51',
                    '&:hover': {
                      borderWidth: 2,
                      borderStyle: 'dashed',
                      backgroundColor: 'rgba(36, 93, 81, 0.04)',
                    }
                  }}
                >
                  Thêm đáp án
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Paper>

        {/* Action Buttons */}
        <Stack direction="row" justifyContent="flex-end" spacing={2} mt={3}>
          <Button
            variant="outlined"
            size="large"
            onClick={handleBack}
            sx={{
              px: 4,
              color: '#666',
              borderColor: '#ddd',
              '&:hover': {
                borderColor: '#999',
                backgroundColor: '#f5f5f5',
              }
            }}
          >
            Hủy
          </Button>
          <Button 
            variant="contained"
            size="large"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            sx={{ 
              px: 4,
              backgroundColor: "#245D51",
              '&:hover': {
                backgroundColor: "#1a4940",
              },
              boxShadow: '0 4px 12px rgba(36, 93, 81, 0.3)',
            }}
          >
            Tạo câu hỏi
          </Button>
        </Stack>
      </Container>

      {/* Snackbar */}
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
    </Box>
  );
}
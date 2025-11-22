// ImportQuestionDialog.tsx
import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  Alert,
  IconButton,
  Collapse,
} from "@mui/material";
import { Upload, CheckCircle, Delete, Edit, ExpandMore, ExpandLess, Save, Cancel } from "@mui/icons-material";
import { Checkbox } from "@mui/material";
interface Chuong {
  id: number;
  tenchuong: string;
}

interface DapAn {
  noiDung: string;
  noiDungHTML: string | null;
  dapAnDung: boolean;
}

interface PreviewQuestion {
  tenHienThi: string;
  noiDungCauHoi: string;
  noiDungCauHoiHTML: string | null;
  loaiCauHoi: string;
  doKho: string;
  idChuong: number;
  mangDapAn: DapAn[];
}

interface faildQuestiom{
  rowNumber: number;
  error: string;
}

interface ImportQuestionDialogProps {
  open: boolean;
  onClose: () => void;
  chuongList: Chuong[];
  accessToken: string;
  onSuccess: () => void;
}

const ImportQuestionDialog = ({
  open,
  onClose,
  chuongList,
  accessToken,
  onSuccess,
}: ImportQuestionDialogProps) => {
  const [selectedChuong, setSelectedChuong] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewQuestions, setPreviewQuestions] = useState<PreviewQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<PreviewQuestion | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  // Phát hiện câu hỏi trùng lặp - chỉ cần tenHienThi HOẶC noiDungCauHoi trùng là báo
  const findDuplicates = (questions: PreviewQuestion[]): Set<number> => {
    const duplicates = new Set<number>();
    const seenTenHienThi = new Map<string, number[]>();
    const seenNoiDung = new Map<string, number[]>();

    questions.forEach((q, index) => {
      const tenHienThi = q.tenHienThi.trim().toLowerCase();
      const noiDung = q.noiDungCauHoi.trim().toLowerCase();

      // Kiểm tra trùng tên hiển thị
      if (seenTenHienThi.has(tenHienThi)) {
        const existing = seenTenHienThi.get(tenHienThi)!;
        existing.forEach(i => duplicates.add(i));
        duplicates.add(index);
        seenTenHienThi.set(tenHienThi, [...existing, index]);
      } else {
        seenTenHienThi.set(tenHienThi, [index]);
      }

      // Kiểm tra trùng nội dung câu hỏi
      if (seenNoiDung.has(noiDung)) {
        const existing = seenNoiDung.get(noiDung)!;
        existing.forEach(i => duplicates.add(i));
        duplicates.add(index);
        seenNoiDung.set(noiDung, [...existing, index]);
      } else {
        seenNoiDung.set(noiDung, [index]);
      }
    });

    return duplicates;
  };

  const duplicateIndices = findDuplicates(previewQuestions);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!selectedChuong) {
      setError("Vui lòng chọn chương trước khi chọn file!");
      return;
    }

    setSelectedFile(file);
    setError("");
    setLoading(true);
    setPreviewQuestions([]);
    setEditingIndex(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res: any= await fetch(`http://localhost:3000/gui-file/import/${selectedChuong}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      console.log(res)

      const dataPre: any = (await res.json());
      const {thanhCong, thatBai} = dataPre;
      const data: PreviewQuestion[] = thanhCong;
      console.log("Preview data:", data);
      const failed: faildQuestiom[] = thatBai;
      if(failed.length>0){
        const errorMessages = failed.map(f => `Dòng ${f.rowNumber}: ${f.error}`).join("\n");
        setError(`Một số câu hỏi không được nhập do lỗi sau:\n${errorMessages}`);
      }
      setPreviewQuestions(data);
    } catch (err) {
      console.log(err)
      console.error("Lỗi khi preview file:", err);
      setError("Không thể đọc file. Vui lòng kiểm tra định dạng file!");
      setSelectedFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToSystem = async () => {
    if (previewQuestions.length === 0) {
      setError("Không có câu hỏi nào để thêm!");
      return;
    }

    if (duplicateIndices.size > 0) {
      setError("Vẫn còn câu hỏi trùng lặp! Vui lòng xóa hoặc sửa các câu trùng trước khi thêm.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // Convert noiDungCauHoi thành HTML và đồng bộ cho cả noiDungCauHoiHTML
      const questionsWithHTML = previewQuestions.map(q => ({
        ...q,
        noiDungCauHoiHTML: q.noiDungCauHoiHTML || `<p>${q.noiDungCauHoi}</p>`,
        mangDapAn: q.mangDapAn.map(da => ({
          ...da,
          noiDungHTML: da.noiDungHTML || `<p>${da.noiDung}</p>`
        }))
      }));

      const res = await fetch(
        `http://localhost:3000/cau-hoi/danh-sach-cau-hoi/chuong/${selectedChuong}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(questionsWithHTML),
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      alert("Thêm câu hỏi thành công!");
      handleClose();
      onSuccess();
    } catch (err) {
      console.error("Lỗi khi thêm câu hỏi:", err);
      setError("Thêm câu hỏi thất bại. Vui lòng thử lại!");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteQuestion = (index: number) => {
    setPreviewQuestions(prev => prev.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditForm(null);
    }
  };

  const handleEditQuestion = (index: number) => {
    setEditingIndex(index);
    setEditForm({ ...previewQuestions[index] });
    if (!expandedCards.has(index)) {
      setExpandedCards(prev => new Set(prev).add(index));
    }
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editForm) {
      // Đồng bộ noiDungCauHoiHTML khi save edit
      const updatedForm = {
        ...editForm,
        noiDungCauHoiHTML: editForm.noiDungCauHoiHTML || `<p>${editForm.noiDungCauHoi}</p>`,
        mangDapAn: editForm.mangDapAn.map(da => ({
          ...da,
          noiDungHTML: da.noiDungHTML || `<p>${da.noiDung}</p>`
        }))
      };
      
      setPreviewQuestions(prev => 
        prev.map((q, i) => i === editingIndex ? updatedForm : q)
      );
      setEditingIndex(null);
      setEditForm(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditForm(null);
  };

  const handleUpdateAnswer = (answerIndex: number, field: 'noiDung' | 'dapAnDung', value: string | boolean) => {
    if (editForm) {
      let updatedAnswers = editForm.mangDapAn.map((ans, i) => 
        i === answerIndex ? { ...ans, [field]: value } : ans
      );

      // Nếu là câu hỏi "Một đáp án đúng" và đang check một đáp án
      if (field === 'dapAnDung' && value === true && editForm.loaiCauHoi === 'MotDung') {
        // Uncheck tất cả các đáp án khác
        updatedAnswers = updatedAnswers.map((ans, i) => ({
          ...ans,
          dapAnDung: i === answerIndex ? true : false
        }));
      }

      setEditForm({ ...editForm, mangDapAn: updatedAnswers });
    }
  };

  const handleClose = () => {
    setSelectedChuong("");
    setSelectedFile(null);
    setPreviewQuestions([]);
    setError("");
    setLoading(false);
    setUploading(false);
    setEditingIndex(null);
    setEditForm(null);
    setExpandedCards(new Set());
    onClose();
  };

  const toggleExpand = (index: number) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const getDoKhoLabel = (doKho: string) => {
    switch (doKho) {
      case "De": return "Dễ";
      case "TrungBinh": return "Trung bình";
      case "Kho": return "Khó";
      default: return doKho;
    }
  };

  const getDoKhoColor = (doKho: string): "success" | "warning" | "error" | "default" => {
    switch (doKho) {
      case "De": return "success";
      case "TrungBinh": return "warning";
      case "Kho": return "error";
      default: return "default";
    }
  };

  const getLoaiCauHoiLabel = (loai: string) => {
    switch (loai) {
      case "MotDung": return "Một đáp án đúng";
      case "NhieuDung": return "Nhiều đáp án đúng";
      default: return loai;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason !== "backdropClick") {
          handleClose();
        }
      }}
      maxWidth="lg"
      fullWidth
      disableEscapeKeyDown
    >
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          Nhập câu hỏi từ file Excel
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Chọn chương */}
          <TextField
            select
            label="Chọn chương"
            value={selectedChuong}
            onChange={(e) => {
              setSelectedChuong(e.target.value);
              setSelectedFile(null);
              setPreviewQuestions([]);
              setError("");
              setEditingIndex(null);
            }}
            fullWidth
            required
            size="small"
          >
            {chuongList.map((chuong) => (
              <MenuItem key={chuong.id} value={chuong.id.toString()}>
                {chuong.tenchuong}
              </MenuItem>
            ))}
          </TextField>

          {/* Choose File */}
          <Box>
            <input
              type="file"
              hidden
              id="import-file-input"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={!selectedChuong || loading || uploading}
            />
            <label htmlFor="import-file-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<Upload />}
                disabled={!selectedChuong || loading || uploading}
                fullWidth
              >
                Choose File
              </Button>
            </label>
            {selectedFile && (
              <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                File đã chọn: <strong>{selectedFile.name}</strong>
              </Typography>
            )}
          </Box>

          {/* Link tải mẫu */}
          <Box>
            <Typography variant="body2" color="primary" sx={{ cursor: "pointer" }}>
              <a 
                href="/template/NhapCauHoi.xlsx" 
                download="Mau_Cau_Hoi.xlsx"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                📥 Tải về định dạng mẫu
              </a>
            </Typography>
          </Box>

          {/* Error message */}
          {error && (
              <Alert severity="error">
                <Box sx={{ whiteSpace: "pre-line" }}>
                  {error}
                </Box>
              </Alert>
            )}


          {/* Duplicate warning */}
          {duplicateIndices.size > 0 && (
            <Alert severity="warning">
              Phát hiện {duplicateIndices.size} câu hỏi trùng lặp! Vui lòng xóa hoặc sửa các câu được đánh dấu đỏ.
            </Alert>
          )}

          {/* Loading */}
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Preview Questions */}
          {previewQuestions.length > 0 && (
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Xem trước ({previewQuestions.length} câu hỏi)
              </Typography>

              <Box sx={{ maxHeight: 500, overflowY: "auto" }}>
                {previewQuestions.map((q, index) => {
                  const isDuplicate = duplicateIndices.has(index);
                  const isEditing = editingIndex === index;
                  const isExpanded = expandedCards.has(index);
                  const currentQuestion = isEditing && editForm ? editForm : q;

                  return (
                    <Card
                      key={index}
                      sx={{
                        mb: 2,
                        border: isDuplicate ? "2px solid #d32f2f" : "1px solid #e0e0e0",
                        boxShadow: isDuplicate ? "0 0 8px rgba(211, 47, 47, 0.3)" : 1,
                        backgroundColor: isDuplicate ? "#ffebee" : "#ffffff",
                      }}
                    >
                      <CardContent>
                        <Stack spacing={1.5}>
                          {/* Header */}
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" flex={1}>
                              <Typography variant="subtitle2" fontWeight="bold">
                                Câu {index + 1}:
                              </Typography>
                              {!isEditing ? (
                                <>
                                  <Typography variant="body2">{q.tenHienThi}</Typography>
                                  <Chip
                                    label={getDoKhoLabel(q.doKho)}
                                    size="small"
                                    color={getDoKhoColor(q.doKho)}
                                  />
                                  <Chip
                                    label={getLoaiCauHoiLabel(q.loaiCauHoi)}
                                    size="small"
                                    variant="outlined"
                                  />
                                  {isDuplicate && (
                                    <Chip label="TRÙNG LẶP" size="small" color="error" />
                                  )}
                                </>
                              ) : (
                                <TextField
                                  value={editForm?.tenHienThi || ""}
                                  onChange={(e) => setEditForm(prev => prev ? { ...prev, tenHienThi: e.target.value } : null)}
                                  size="small"
                                  label="Tên hiển thị"
                                  sx={{ minWidth: 200 }}
                                />
                              )}
                            </Stack>

                            <Stack direction="row" spacing={0.5}>
                              {!isEditing ? (
                                <>
                                  <IconButton size="small" color="primary" onClick={() => handleEditQuestion(index)}>
                                    <Edit fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" color="error" onClick={() => handleDeleteQuestion(index)}>
                                    <Delete fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" onClick={() => toggleExpand(index)}>
                                    {isExpanded ? <ExpandLess /> : <ExpandMore />}
                                  </IconButton>
                                </>
                              ) : (
                                <>
                                  <IconButton size="small" color="success" onClick={handleSaveEdit}>
                                    <Save fontSize="small" />
                                  </IconButton>
                                  <IconButton size="small" color="default" onClick={handleCancelEdit}>
                                    <Cancel fontSize="small" />
                                  </IconButton>
                                </>
                              )}
                            </Stack>
                          </Stack>

                          <Collapse in={isExpanded || isEditing}>
                            {/* Edit mode fields */}
                            {isEditing && (
                              <Stack spacing={2} sx={{ pl: 2, pt: 1 }}>
                                <Stack direction="row" spacing={2}>
                                  <TextField
                                    select
                                    label="Độ khó"
                                    value={editForm?.doKho || ""}
                                    onChange={(e) => setEditForm(prev => prev ? { ...prev, doKho: e.target.value } : null)}
                                    size="small"
                                    sx={{ minWidth: 150 }}
                                  >
                                    <MenuItem value="De">Dễ</MenuItem>
                                    <MenuItem value="TrungBinh">Trung bình</MenuItem>
                                    <MenuItem value="Kho">Khó</MenuItem>
                                  </TextField>
                                  <TextField
                                    select
                                    label="Loại câu hỏi"
                                    value={editForm?.loaiCauHoi || ""}
                                    onChange={(e) => setEditForm(prev => prev ? { ...prev, loaiCauHoi: e.target.value } : null)}
                                    size="small"
                                    sx={{ minWidth: 200 }}
                                  >
                                    <MenuItem value="MotDung">Một đáp án đúng</MenuItem>
                                    <MenuItem value="NhieuDung">Nhiều đáp án đúng</MenuItem>
                                  </TextField>
                                </Stack>
                              </Stack>
                            )}

                            {/* Nội dung câu hỏi */}
                            <Box sx={{ pl: 2 }}>
                              {!isEditing ? (
                                <Typography variant="body2" color="text.secondary">
                                  <strong>Nội dung:</strong> {q.noiDungCauHoi}
                                </Typography>
                              ) : (
                                <TextField
                                  value={editForm?.noiDungCauHoi || ""}
                                  onChange={(e) => setEditForm(prev => prev ? { ...prev, noiDungCauHoi: e.target.value } : null)}
                                  label="Nội dung câu hỏi"
                                  multiline
                                  rows={2}
                                  fullWidth
                                  size="small"
                                />
                              )}
                            </Box>

                            {/* Đáp án */}
                            <Box sx={{ pl: 2 }}>
                              <Typography variant="caption" fontWeight="bold">
                                Đáp án:
                              </Typography>
                              {currentQuestion.mangDapAn.map((da, idx) => (
                                <Stack
                                  key={idx}
                                  direction="row"
                                  spacing={1}
                                  alignItems="center"
                                  sx={{ mt: 0.5 }}
                                >
                                  {!isEditing ? (
                                    <>
                                      {da.dapAnDung && (
                                        <CheckCircle sx={{ fontSize: 16, color: "green" }} />
                                      )}
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          fontWeight: da.dapAnDung ? "bold" : "normal",
                                          color: da.dapAnDung ? "green" : "text.primary",
                                        }}
                                      >
                                        {String.fromCharCode(65 + idx)}. {da.noiDung}
                                      </Typography>
                                    </>
                                  ) : (
                                    <>
                                      <Checkbox
  checked={da.dapAnDung}
  onChange={(e) =>
    handleUpdateAnswer(idx, "dapAnDung", e.target.checked)
  }
  sx={{ width: 40 }}
/>
                                      <Typography variant="body2" sx={{ minWidth: 20 }}>
                                        {String.fromCharCode(65 + idx)}.
                                      </Typography>
                                      <TextField
                                        value={da.noiDung}
                                        onChange={(e) => handleUpdateAnswer(idx, 'noiDung', e.target.value)}
                                        size="small"
                                        fullWidth
                                      />
                                    </>
                                  )}
                                </Stack>
                              ))}
                            </Box>
                          </Collapse>
                        </Stack>
                      </CardContent>
                    </Card>
                  );
                })}
              </Box>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleAddToSystem}
          disabled={previewQuestions.length === 0 || uploading || duplicateIndices.size > 0}
          startIcon={uploading ? <CircularProgress size={16} /> : null}
        >
          {uploading ? "Đang thêm..." : "Thêm vào hệ thống"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportQuestionDialog;
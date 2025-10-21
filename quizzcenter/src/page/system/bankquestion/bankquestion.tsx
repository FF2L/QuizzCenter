import AddIcon from "@mui/icons-material/Add";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useMemo } from "react";
import { Chuong, CauHoi, CauHoiPayload } from "../../../common/model";
import { IconButton, Box, Button, Card, CardContent, Stack, TextField, Typography, MenuItem, Pagination, CircularProgress, InputAdornment } from "@mui/material";
import { Delete, Edit, Visibility, Search } from "@mui/icons-material";

import DeleteConfirmDialog from "./deleteConfirmDialog";
import CreateQuestionDialog from "./createQuestionDialog";
import QuestionDetailDialog from "./deTailDialog";
import UpdateQuestionDialog from "./updateQuestionDialog";
import { LectureService } from "../../../services/lecture.api";

// Đồng bộ enum với BE
export enum DoKho {
  De = "De",
  TrungBinh = "TrungBinh",
  Kho = "Kho",
}

const BankQuestion = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [selectedChuongName, setSelectedChuongName] = useState("");
  const { idMonHoc } = useParams<{ idMonHoc: string }>();
  const [chuongList, setChuongList] = useState<Chuong[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { tenMonHoc } = location.state || {};
  const idMonHocNumber = Number(idMonHoc);
  const [currentQuestionDetail, setCurrentQuestionDetail] = useState<CauHoiPayload | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Dialogs
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Questions + server paging
  const [questions, setQuestions] = useState<CauHoiPayload[]>([]);
  const [questionToDelete, setQuestionToDelete] = useState<{ id: number; name: string } | null>(null);
  const [updateQuestionId, setUpdateQuestionId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  const accessToken = localStorage.getItem("accessTokenGV") || "";

  // Filters
  const [difficulty, setDifficulty] = useState<DoKho | "">("");
  const [searchText, setSearchText] = useState("");

  // Pagination (server side)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // khớp với service default
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const navigate = useNavigate();

  // Lấy chương mặc định từ route state (nếu có)
  useEffect(() => {
    if (location.state?.idChuong) {
      setSelectedCategory(String(location.state.idChuong));
      setSelectedChuongName(location.state.tenChuong ?? "");
    }
  }, [location.state]);

  // Fetch chapter list
  useEffect(() => {
    const fetchChuong = async () => {
      if (!idMonHocNumber) return;
      setLoading(true);
      try {
        const res = await LectureService.layTatCaChuongTheoMonHoc(idMonHocNumber, accessToken);
        const data: Chuong[] = res.data;
        setChuongList(data);

        const defaultChuong = location.state?.idChuong
          ? data.find((c) => c.id === Number(location.state.idChuong))
          : data[0];
        if (defaultChuong) {
          setSelectedCategory(String(defaultChuong.id));
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

  // Fetch questions (server-side pagination + filter)
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!selectedCategory) return;
      setLoading(true);
      try {
        const res = await LectureService.layTatCauHoiTheoChuong(
          accessToken,
          Number(selectedCategory),
          currentPage,
          itemsPerPage,
          difficulty || undefined,
          searchText || undefined
        );
        // API trả về: { data: [...], total, currentPage, totalPages }
        const list: CauHoi[] = res.data.data ?? [];
        const payloads: CauHoiPayload[] = list.map((cauHoi) => ({
          cauHoi,
          dapAn: [],
          mangFileDinhKem: [],
        }));
        setQuestions(payloads);
        setTotal(res.data.total ?? payloads.length);
        setTotalPages(res.data.totalPages ?? 1);
        // Đồng bộ lại currentPage nếu BE có thể trả khác
        if (typeof res.data.currentPage === "number") {
          setCurrentPage(res.data.currentPage);
        }
      } catch (err) {
        console.error("Lỗi khi fetch câu hỏi:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [selectedCategory, currentPage, itemsPerPage, difficulty, searchText]);

  // Khi đổi chương / filter thì về trang 1
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, difficulty, searchText]);

  // Fetch question detail
  const fetchQuestionDetail = async (id: number) => {
    try {
      const res = await LectureService.layChiTIetCauHoi(accessToken, id);
      const data: CauHoiPayload = await res.data;
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
      // Sau khi xóa, refetch trang hiện tại
      setQuestions((prev) => prev.filter((q) => q.cauHoi.id !== questionToDelete.id));
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
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      alert("Upload thành công!");
      // Refetch trang 1 sau khi import
      setCurrentPage(1);
    } catch (err) {
      console.error("Lỗi khi upload file:", err);
      alert("Upload thất bại!");
    }
  };

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", borderRadius: "10px", p: 0 }}>
      <Stack spacing={4}>
        <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
          <Typography variant="h3" sx={{ fontWeight: "bold", fontSize: "30px", color: "black" }}>
            Ngân hàng câu hỏi
          </Typography>
        </Box>

        {/* Toolbar: Chọn chương + Tìm kiếm + Độ khó + Actions */}
        <Stack direction={{ xs: "column", md: "column" }} gap={2}>
          {/* Hàng 1: Chọn chương (ở trên) */}
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
            <TextField
              select
              label="Chọn chương"
              value={selectedCategory}
              onChange={(e) => {
                const selectedId = e.target.value;
                setSelectedCategory(selectedId);
                const chuong = chuongList.find((c) => c.id.toString() === selectedId);
                setSelectedChuongName(chuong?.tenChuong || "");
              }}
              sx={{ minWidth: "auto", maxWidth: "auto", backgroundColor: "white", borderRadius: 2 }}
              size="small"
            >
              {chuongList.map((chuong) => (
                <MenuItem key={chuong.id} value={chuong.id.toString()}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                    <span>{chuong.tenChuong}</span>
                    {typeof (chuong as any).soLuongCauHoi !== 'undefined' && (
                      <Typography variant="caption" sx={{ opacity: 0.7 }}> ({(chuong as any).soLuongCauHoi})</Typography>
                    )}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          {/* Hàng 2: Tìm kiếm + Độ khó (bên trái) | Actions (bên phải) */}
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={2}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
              {/* Tìm kiếm nội dung câu hỏi */}
              <TextField
                placeholder="Tìm theo nội dung câu hỏi..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                sx={{ width: "30vw", backgroundColor: "white", borderRadius: 2, flexShrink: 0 }}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Bộ lọc Độ khó */}
              <TextField
                select
                label="Độ khó"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DoKho | "")}
                sx={{ minWidth: 150, maxWidth: 200, backgroundColor: "white", borderRadius: 2 }}
                size="small"
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value={DoKho.De}>Dễ</MenuItem>
                <MenuItem value={DoKho.TrungBinh}>Trung bình</MenuItem>
                <MenuItem value={DoKho.Kho}>Khó</MenuItem>
              </TextField>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                color="primary"
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() =>
                  navigate("/lecturer/create-question", {
                    state: {
                      idChuong: Number(selectedCategory),
                      idMonHoc: idMonHoc,
                      tenMonHoc: tenMonHoc,
                      tenChuong: selectedChuongName,
                      returnPath: location.pathname,
                      returnTab: "bankQuestion",
                    },
                  })
                }
              >
                Thêm câu hỏi
              </Button>

              <Button color="secondary" variant="outlined" onClick={() => fileInputRef.current?.click()}>
                <img src="/assets/FileIcon.png" style={{ height: 24, width: 24, marginRight: 8 }} />
                Nhập File
                <input type="file" hidden accept=".xlsx,.xls" ref={fileInputRef} onChange={handleFileChange} />
              </Button>
              {selectedFile && (
                <Button variant="outlined" color="secondary" onClick={handleUpload}>
                  Tải lên
                </Button>
              )}
            </Stack>
          </Stack>
        </Stack>

        {/* Summary bar */}
        <Stack direction="row" alignItems="center" gap={2}>
          <Typography variant="body2" sx={{ color: "#245D51" }}>
            Tổng số: <b>{total}</b>
          </Typography>
          {loading && <CircularProgress size={16} />}
        </Stack>

        {/* Questions list */}
        <Box>
          <Typography sx={{ mb: 2, color: "#245D51" }}>Danh sách câu hỏi</Typography>
          <Box sx={{ border: "1px solid #ddd", borderRadius: 2, p: 2, backgroundColor: "#fafafa" }}>
            {questions.length === 0 && !loading && (
              <Typography variant="body2">Không có dữ liệu.</Typography>
            )}
            {questions.map((q, index) => (
              <Card
                key={q.cauHoi.id}
                sx={{
                  mb: 2,
                  borderRadius: 2,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                  "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.15)" },
                  backgroundColor: "#ffffff",
                }}
              >
                <CardContent sx={{ minHeight: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Stack direction="row" spacing={2}>
                    <Typography sx={{ fontSize: 18, fontWeight: "bold" }}>
                      Câu {(index + 1) + (currentPage - 1) * itemsPerPage}:
                    </Typography>
                    <Typography sx={{ fontSize: 18, fontWeight: 500 }}>{q.cauHoi.tenHienThi}</Typography>
                    <Typography variant="caption" sx={{ alignSelf: "center", opacity: 0.7 }}>
                      ({q.cauHoi.doKho})
                    </Typography>
                  </Stack>

                  <Stack direction="row">
                    <IconButton sx={{ color: "#0DC913" }} onClick={() => { setUpdateQuestionId(q.cauHoi.id); setOpenUpdateDialog(true); }}>
                      <Edit />
                    </IconButton>
                    <IconButton sx={{ color: "#DB9C14" }} onClick={() => fetchQuestionDetail(q.cauHoi.id)}>
                      <Visibility />
                    </IconButton>
                    <IconButton
                      sx={{ color: "#d32f2f" }}
                      onClick={() => {
                        setQuestionToDelete({ id: q.cauHoi.id, name: q.cauHoi.tenHienThi });
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

        {/* Pagination (server side) */}
            {
          totalPages > 1 &&         <Stack alignItems="center" sx={{ mt: 2 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_e, page) => setCurrentPage(page)}
            color="primary"
          />
        </Stack>
            }
      </Stack>

      {/* Dialogs */}
      <CreateQuestionDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        idChuong={Number(selectedCategory)}
        onCreated={(payload: CauHoiPayload) => {
          setQuestions((prev) => [payload, ...prev]);
          setOpenCreateDialog(false);
          setTotal((t) => t + 1);
        }}
      />
      <QuestionDetailDialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} questionDetail={currentQuestionDetail} />
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
          const fullPayload: CauHoiPayload = { ...payload, mangFileDinhKem: (payload as CauHoiPayload).mangFileDinhKem ?? [] };
          setQuestions((prev) => prev.map((q) => (q.cauHoi.id === fullPayload.cauHoi.id ? fullPayload : q)));
        }}
      />
    </Box>
  );
};

export default BankQuestion;

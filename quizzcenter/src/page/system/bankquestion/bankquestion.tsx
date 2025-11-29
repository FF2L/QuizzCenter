import AddIcon from "@mui/icons-material/Add";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Chuong, CauHoi, CauHoiPayload } from "../../../common/model";
import { 
  IconButton, Box, Button, Card, CardContent, Stack, TextField, 
  Typography, MenuItem, Pagination, CircularProgress, InputAdornment,
  Collapse, Chip, Divider
} from "@mui/material";
import { 
  Delete, Edit, Visibility, Search, ExpandMore, ExpandLess, CheckCircle,
  FilterList, SortByAlpha, Category
} from "@mui/icons-material";

import DeleteConfirmDialog from "./deleteConfirmDialog";
import QuestionDetailDialog from "./deTailDialog";
import ImportQuestionDialog from "./importQuestionDialog";
import { LectureService } from "../../../services/lecture.api";

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
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { tenMonHoc } = location.state || {};
  const idMonHocNumber = Number(idMonHoc);
  const [currentQuestionDetail, setCurrentQuestionDetail] = useState<CauHoiPayload | null>(null);

  // State cho expand/collapse
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const [questionDetails, setQuestionDetails] = useState<Map<number, CauHoiPayload>>(new Map());
  const [loadingDetails, setLoadingDetails] = useState<Set<number>>(new Set());

  // Dialogs
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openImportDialog, setOpenImportDialog] = useState(false);

  // Questions + server paging
  const [questions, setQuestions] = useState<CauHoiPayload[]>([]);
  const [questionToDelete, setQuestionToDelete] = useState<{ id: number; name: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");

  const accessToken = localStorage.getItem("accessTokenGV") || "";

  // Filters
  const [difficulty, setDifficulty] = useState<DoKho | "">("");
  const [searchText, setSearchText] = useState("");

  // Filter phía trên danh sách
  const [listFilterDifficulty, setListFilterDifficulty] = useState<DoKho | "">("");
  const [listSortBy, setListSortBy] = useState<string>("newest"); // newest, oldest, name-asc, name-desc

  // Pagination (server side)
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
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
          setSelectedChuongName(defaultChuong.tenchuong);
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
      const list: CauHoi[] = res.data.data ?? [];
      const payloads: CauHoiPayload[] = list.map((cauHoi) => ({
        cauHoi,
        dapAn: [],
        mangFileDinhKem: [],
      }));
      setQuestions(payloads);
      setTotal(res.data.total ?? payloads.length);
      setTotalPages(res.data.totalPages ?? 1);
      if (typeof res.data.currentPage === "number") {
        setCurrentPage(res.data.currentPage);
      }
    } catch (err) {
      console.error("Lỗi khi fetch câu hỏi:", err);
    } finally {
      setLoading(false);
    }
  };

  const getChuongName = (idChuong: number): string => {
    const chuong = chuongList.find((c) => c.id === idChuong);
    return chuong?.tenchuong || `Chương ${idChuong}`;
  };

  useEffect(() => {
    fetchQuestions();
  }, [selectedCategory, currentPage, itemsPerPage, difficulty, searchText]);

  // Khi đổi chương / filter thì về trang 1
  useEffect(() => {
    setCurrentPage(1);
    setExpandedQuestions(new Set());
  }, [selectedCategory, difficulty, searchText]);

  // Fetch question detail khi expand
  const fetchQuestionDetailForExpand = async (id: number) => {
    if (questionDetails.has(id)) return;
    
    setLoadingDetails(prev => new Set(prev).add(id));
    try {
      const res = await LectureService.layChiTIetCauHoi(accessToken, id);
      const data: CauHoiPayload = await res.data;
      setQuestionDetails(prev => new Map(prev).set(id, data));
    } catch (err) {
      console.error("Lỗi khi fetch chi tiết câu hỏi:", err);
    } finally {
      setLoadingDetails(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Toggle expand/collapse
  const handleToggleExpand = (id: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
      fetchQuestionDetailForExpand(id);
    }
    setExpandedQuestions(newExpanded);
  };

  // Fetch question detail cho dialog
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
      const res = await fetch(`http://localhost:3000/cau-hoi/${questionToDelete.id}`, { 
       method: "DELETE",
       headers: {
       Authorization: `Bearer ${accessToken}`,
         }
        });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      setQuestions((prev) => prev.filter((q) => q.cauHoi.id !== questionToDelete.id));
      setOpenDeleteDialog(false);
      setQuestionToDelete(null);
      alert("Xóa thành công!");
      fetchQuestions();
    } catch (err) {
      console.error("Lỗi khi xóa câu hỏi:", err);
      alert("Xóa thất bại!");
    }
  };

  // Handle import success
  const handleImportSuccess = () => {
    setCurrentPage(1);
    fetchQuestions();
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

  // Filter và sort questions ở client side
  const getFilteredAndSortedQuestions = () => {
    let filtered = [...questions];

    // Filter theo độ khó (list filter)
    if (listFilterDifficulty) {
      filtered = filtered.filter(q => q.cauHoi.doKho === listFilterDifficulty);
    }

    // Sort
    switch (listSortBy) {
      case "name-asc":
        filtered.sort((a, b) => a.cauHoi.tenHienThi.localeCompare(b.cauHoi.tenHienThi));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.cauHoi.tenHienThi.localeCompare(a.cauHoi.tenHienThi));
        break;
      case "oldest":
        filtered.sort((a, b) => a.cauHoi.id - b.cauHoi.id);
        break;
      case "newest":
      default:
        filtered.sort((a, b) => b.cauHoi.id - a.cauHoi.id);
        break;
    }

    return filtered;
  };

  const filteredQuestions = getFilteredAndSortedQuestions();

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", borderRadius: "10px", p: 0 }}>
      <Stack spacing={4}>
        <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
          <Typography variant="h3" sx={{ fontWeight: "bold", fontSize: "30px", color: "black" }}>
            Ngân hàng câu hỏi
          </Typography>
        </Box>

        {/* Toolbar */}
        <Stack direction={{ xs: "column", md: "column" }} gap={2}>
          {/* Hàng 1: Chọn chương */}
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
            <TextField
              select
              label="Chọn chương"
              value={selectedCategory}
              onChange={(e) => {
                const selectedId = e.target.value;
                setSelectedCategory(selectedId);
                const chuong = chuongList.find((c) => c.id.toString() === selectedId);
                setSelectedChuongName(chuong?.tenchuong || "");
              }}
              sx={{ minWidth: "auto", maxWidth: "auto", backgroundColor: "white", borderRadius: 2 }}
              size="small"
            >
              {chuongList.map((chuong) => (
                <MenuItem key={chuong.id} value={chuong.id.toString()}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                    <span>{chuong.tenchuong}</span>
                    {typeof (chuong as any).soLuongCauHoi !== 'undefined' && (
                      <Typography variant="caption" sx={{ opacity: 0.7 }}> ({(chuong as any).soLuongCauHoi})</Typography>
                    )}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          {/* Hàng 2: Tìm kiếm + Độ khó | Actions */}
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={2}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
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

              <Button 
                color="secondary" 
                variant="outlined" 
                onClick={() => setOpenImportDialog(true)}
              >
                <img src="/assets/FileIcon.png" style={{ height: 24, width: 24, marginRight: 8 }} />
                Nhập File
              </Button>
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
          
          {/* FILTER PHÍA TRÊN DANH SÁCH */}
          <Box sx={{ 
            backgroundColor: "#fff", 
            border: "1px solid #ddd", 
            borderRadius: "8px 8px 0 0",
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2
          }}>
            <Stack direction="row" spacing={2} alignItems="center" flex={1}>
              <FilterList sx={{ color: "#245D51" }} />
              
              <TextField
                select
                label="Lọc theo độ khó"
                value={listFilterDifficulty}
                onChange={(e) => setListFilterDifficulty(e.target.value as DoKho | "")}
                sx={{ minWidth: 180, backgroundColor: "white" }}
                size="small"
              >
                <MenuItem value="">Tất cả độ khó</MenuItem>
                <MenuItem value={DoKho.De}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label="Dễ" size="small" color="success" />
                  </Stack>
                </MenuItem>
                <MenuItem value={DoKho.TrungBinh}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label="Trung bình" size="small" color="warning" />
                  </Stack>
                </MenuItem>
                <MenuItem value={DoKho.Kho}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label="Khó" size="small" color="error" />
                  </Stack>
                </MenuItem>
              </TextField>

              <Divider orientation="vertical" flexItem />

       
              
              <TextField
                select
                label="Sắp xếp theo"
                value={listSortBy}
                onChange={(e) => setListSortBy(e.target.value)}
                sx={{ minWidth: 180, backgroundColor: "white" }}
                size="small"
              >
                <MenuItem value="newest">Mới nhất</MenuItem>
                <MenuItem value="oldest">Cũ nhất</MenuItem>
                <MenuItem value="name-asc">Tên A-Z</MenuItem>
                <MenuItem value="name-desc">Tên Z-A</MenuItem>
              </TextField>
            </Stack>

            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Hiển thị <b>{filteredQuestions.length}</b> / {questions.length} câu hỏi
            </Typography>
          </Box>

          <Box sx={{ border: "1px solid #ddd", borderTop: "none", borderRadius: "0 0 8px 8px", p: 2, backgroundColor: "#fafafa" }}>
            {filteredQuestions.length === 0 && !loading && (
              <Typography variant="body2">Không có dữ liệu.</Typography>
            )}
            {filteredQuestions.map((q, index) => {
              const isExpanded = expandedQuestions.has(q.cauHoi.id);
              const detail = questionDetails.get(q.cauHoi.id);
              const isLoadingDetail = loadingDetails.has(q.cauHoi.id);

              return (
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
                  <CardContent sx={{ minHeight: 25, display:'flex', flexDirection:"column"}}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent:'space-between',
                        gap: 2,
                        width: "100%", 
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          cursor: "pointer",
                          "&:hover": { backgroundColor: "#f5f5f5" },
                          p: 1,
                          borderRadius: 1,
                          flex: 1,
                        }}
                        onClick={() => handleToggleExpand(q.cauHoi.id)}
                      >
                        <IconButton size="small" sx={{ flexShrink: 0 }}>
                          {isExpanded ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                        <Typography sx={{ fontSize: 18, fontWeight: "bold", flexShrink: 0 }}>
                          Câu {(index + 1) + (currentPage - 1) * itemsPerPage}:
                        </Typography>
                        <Typography 
                          sx={{ 
                            fontSize: 18, 
                            fontWeight: 500,
                            flex: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {q.cauHoi.tenHienThi}
                        </Typography>
                        <Chip 
                          label={getDoKhoLabel(q.cauHoi.doKho)} 
                          size="small"
                          color={getDoKhoColor(q.cauHoi.doKho)}
                          sx={{ flexShrink: 0, marginLeft:"20px" }}
                        />
                      </Box>

                      <Box sx={{ flexShrink: 0, display:'flex',flexDirection:"row"}}>
                        <IconButton 
                          sx={{ color: "#0DC913" }}  
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/lecturer/update-question/${q.cauHoi.id}`, {
                              state: {
                                idChuong: Number(selectedCategory),
                                idMonHoc: idMonHoc,
                                tenMonHoc: tenMonHoc,
                                tenChuong: selectedChuongName,
                                returnPath: location.pathname,
                                returnTab: "bankQuestion",
                              },
                            });
                          }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          sx={{ color: "#DB9C14" }} 
                          onClick={(e) => {
                            e.stopPropagation();
                            fetchQuestionDetail(q.cauHoi.id);
                          }}
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          sx={{ color: "#d32f2f" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuestionToDelete({ id: q.cauHoi.id, name: q.cauHoi.tenHienThi });
                            setOpenDeleteDialog(true);
                          }}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>

                    <Collapse in={isExpanded} sx={{ width: '100%' }}>
                      <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid #e0e0e0" }}>
                        {isLoadingDetail ? (
                          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                            <CircularProgress size={24} />
                          </Box>
                        ) : detail ? (
                          <Stack spacing={3}>
                            <Box>
                              {detail.cauHoi.noiDungCauHoiHTML ? (
                                <Box 
                                  dangerouslySetInnerHTML={{ __html: detail.cauHoi.noiDungCauHoiHTML }}
                                  sx={{ pl: 2, color: "text.secondary" }}
                                />
                              ) : (
                                <Typography sx={{ pl: 2, color: "text.secondary" }}>
                                  {detail.cauHoi.noiDungCauHoi}
                                </Typography>
                              )}
                            </Box>

                            <Box>
                              {detail.dapAn && detail.dapAn.length > 0 ? (
                                <Stack spacing={1} sx={{ pl: 2 }}>
                                  {detail.dapAn.map((da, idx) => (
                                    <Box
                                      key={idx}
                                      sx={{
                                        display: "grid",
                                        gridTemplateColumns: "24px 1fr",
                                        alignItems: "center",
                                        gap: 8,
                                      }}
                                    >
                                      <Typography
                                        sx={{
                                          fontWeight: da.dapAnDung ? "bold" : "normal",
                                          color: da.dapAnDung ? "green" : "text.primary",
                                        }}
                                      >
                                        {String.fromCharCode(65 + idx)}.
                                      </Typography>

                                      {da.noiDungHTML ? (
                                        <Box
                                          dangerouslySetInnerHTML={{ __html: da.noiDungHTML }}
                                          sx={{
                                            fontWeight: da.dapAnDung ? "bold" : "normal",
                                            color: da.dapAnDung ? "green" : "text.primary",
                                          }}
                                        />
                                      ) : (
                                        <Typography
                                          sx={{
                                            fontWeight: da.dapAnDung ? "bold" : "normal",
                                            color: da.dapAnDung ? "green" : "text.primary",
                                          }}
                                        >
                                          {da.noiDung}
                                        </Typography>
                                      )}
                                    </Box>
                                  ))}
                                </Stack>
                              ) : (
                                <Typography variant="body2" sx={{ pl: 2, fontStyle: "italic", color: "text.secondary" }}>
                                  Chưa có đáp án
                                </Typography>
                              )}
                            </Box>

                            {detail.mangFileDinhKem && detail.mangFileDinhKem.length > 0 && (
                              <Box>
                                <Typography variant="subtitle2" fontWeight="bold" color="primary" sx={{ mb: 1.5 }}>
                                  File đính kèm:
                                </Typography>
                                <Stack spacing={1} sx={{ pl: 2 }}>
                                  {detail.mangFileDinhKem.map((file, idx) => (
                                    <Typography key={idx} variant="body2" sx={{ color: "text.secondary" }}>
                                      📎 {file.tenFile || `File ${idx + 1}`}
                                    </Typography>
                                  ))}
                                </Stack>
                              </Box>
                            )}
                          </Stack>
                        ) : null}
                      </Box>
                    </Collapse>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </Box>

        {/* Pagination */}
        {totalPages > 1 && (
          <Stack alignItems="center" sx={{ mt: 2 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(_e, page) => setCurrentPage(page)}
              color="primary"
            />
          </Stack>
        )}
      </Stack>

      {/* Dialogs */}
      <QuestionDetailDialog 
        open={openDetailDialog} 
        onClose={() => setOpenDetailDialog(false)} 
        questionDetail={currentQuestionDetail} 
        chuongName={currentQuestionDetail ? getChuongName(currentQuestionDetail.cauHoi.idChuong) : ""}
      />

      <DeleteConfirmDialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleDeleteQuestion}
        questionName={questionToDelete?.name}
      />
      <ImportQuestionDialog
        open={openImportDialog}
        onClose={() => setOpenImportDialog(false)}
        chuongList={chuongList}
        accessToken={accessToken}
        onSuccess={handleImportSuccess}
      />
    </Box>
  );
};

export default BankQuestion;
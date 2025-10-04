import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Stack,
  Button,
  IconButton,
  Chip,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloseIcon from "@mui/icons-material/Close";

interface Chuong {
  id: number;
  tenChuong: string;
}

interface CauHoi {
  id: number;
  tenHienThi: string;
  noiDungCauHoi: string;
  noiDungCauHoiHTML: string;
  loaiCauHoi: string;
  doKho: string;
  idChuong: number;
}

interface CauHoiDetail {
  cauHoi: CauHoi;
  mangDapAn: Array<{
    id: number;
    noiDung: string;
    noiDungHTML: string;
    dapAnDung: boolean;
  }>;
  mangFileDinhKem: Array<{
    id: number;
    duongDan: string;
  }>;
}

interface CauHoiDetailWithChuong extends CauHoiDetail {
  tenChuong?: string;
}

export default function SelectFromBankPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as {
    idBaiKiemTra?: number;
    idMonHoc?: number;
    tenMonHoc?: string;
    tenBaiKiemTra?: string;
  };

  const idBaiKiemTra = state?.idBaiKiemTra;
  const idMonHoc = state?.idMonHoc;
  const tenMonHoc = state?.tenMonHoc || "";
  const tenBaiKiemTra = state?.tenBaiKiemTra || "";

  const [chuongList, setChuongList] = useState<Chuong[]>([]);
  const [selectedChuong, setSelectedChuong] = useState<number | "">("");
  const [cauHoiList, setCauHoiList] = useState<CauHoi[]>([]);
  const [loading, setLoading] = useState(false);

  // Trạng thái câu hỏi "đang có trong đề" hiện tại (state hiển thị)
  const [cauHoiDaCoTrongDe, setCauHoiDaCoTrongDe] = useState<Set<number>>(new Set());
  // Snapshot gốc để so sánh khi lưu / rời trang
  const [cauHoiDaCoTrongDeGoc, setCauHoiDaCoTrongDeGoc] = useState<Set<number>>(new Set());
  // Map idCauHoi -> idChiTiet (để xoá từng item trên BE)
  const [mapChiTietByCauHoiId, setMapChiTietByCauHoiId] = useState<Map<number, number>>(new Map());

  // Dialog chi tiết
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedCauHoi, setSelectedCauHoi] = useState<CauHoiDetailWithChuong | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Dialog confirm bỏ thay đổi
const [openConfirmBack, setOpenConfirmBack] = useState(false);

// Dialog thông báo lỗi/thành công
const [openMessage, setOpenMessage] = useState(false);
const [message, setMessage] = useState("");


  // ========== Fetch danh sách chương ==========
  useEffect(() => {
    const fetchChuong = async () => {
      if (!idMonHoc) return;
      try {
        const res = await fetch(`http://localhost:3000/chuong?idMonHoc=${idMonHoc}`);
        if (!res.ok) throw new Error("Không thể tải danh sách chương");
        const data: Chuong[] = await res.json();
        setChuongList(data);
        if (data.length > 0) {
          setSelectedChuong(data[0].id);
        }
      } catch (error) {
        console.error("Lỗi khi tải chương:", error);
        alert("Không thể tải danh sách chương!");
      }
    };
    fetchChuong();
  }, [idMonHoc]);

  // ========== Fetch câu hỏi đã có trong đề (snapshot gốc + map chi tiết) ==========
  useEffect(() => {
    const fetchCauHoiTrongDe = async () => {
      if (!idBaiKiemTra) return;

      try {
        const res = await fetch(
          `http://localhost:3000/bai-kiem-tra/chi-tiet-cau-hoi/${idBaiKiemTra}?skip=0&limit=1000`
        );
        if (!res.ok) throw new Error("Không thể tải câu hỏi trong đề");
        const data = await res.json();

        const idSet = new Set<number>();
        const mapping = new Map<number, number>();

        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            if (item.idCauHoi) {
              idSet.add(item.idCauHoi);
              if (item.id) mapping.set(item.idCauHoi, item.id);
            }
          });
        }
        setCauHoiDaCoTrongDe(idSet);
        setCauHoiDaCoTrongDeGoc(new Set(idSet)); // snapshot
        setMapChiTietByCauHoiId(mapping);
      } catch (error) {
        console.error("Lỗi khi tải câu hỏi trong đề:", error);
      }
    };

    fetchCauHoiTrongDe();
  }, [idBaiKiemTra]);

  // ========== Đặt lại trang khi đổi chương ==========
  useEffect(() => {
    setPage(1);
  }, [selectedChuong]);

  // ========== Fetch câu hỏi theo chương + trang ==========
  useEffect(() => {
    const fetchCauHoi = async () => {
      if (!selectedChuong) return;
      try {
        setLoading(true);
        const skip = (page - 1) * limit;
        const res = await fetch(
          `http://localhost:3000/chuong/${selectedChuong}/cau-hoi?skip=${skip}&limit=${limit}`
        );
        if (!res.ok) throw new Error("Không thể tải câu hỏi");
        const data = await res.json();

        if (data.items && typeof data.total === "number") {
          setCauHoiList(data.items);
          setTotalPages(Math.ceil(data.total / limit));
        } else {
          setCauHoiList(Array.isArray(data) ? data : []);
          setTotalPages(1);
        }
      } catch (error) {
        console.error("Lỗi khi tải câu hỏi:", error);
        alert("Không thể tải danh sách câu hỏi!");
      } finally {
        setLoading(false);
      }
    };

    if (selectedChuong) fetchCauHoi();
  }, [selectedChuong, page]);

  // ========== Helpers ==========
const hasUnsavedChanges = () => {
  if (cauHoiDaCoTrongDe.size !== cauHoiDaCoTrongDeGoc.size) return true;
  
  // Chuyển set thành mảng để for...of không báo lỗi
  for (const id of Array.from(cauHoiDaCoTrongDe)) {
    if (!cauHoiDaCoTrongDeGoc.has(id)) return true;
  }
  return false;
};


  // ========== Điều hướng quay lại (không lưu) ==========
 const handleBack = () => {
  if (hasUnsavedChanges()) {
    setOpenConfirmBack(true);
  } else {
    navigate(`/bai-kiem-tra/${idBaiKiemTra}`, {
      state: { idBaiKiemTra, idMonHoc, tenMonHoc, tenBaiKiemTra },
    });
  }
};

const confirmBack = () => {
  setOpenConfirmBack(false);
  navigate(`/bai-kiem-tra/${idBaiKiemTra}`, {
    state: { idBaiKiemTra, idMonHoc, tenMonHoc, tenBaiKiemTra },
  });
};

  // ========== Xem chi tiết câu hỏi ==========
  const handleViewDetail = async (idCauHoi: number) => {
    try {
      setLoadingDetail(true);
      const res = await fetch(`http://localhost:3000/cau-hoi/${idCauHoi}`);
      if (!res.ok) throw new Error("Không thể tải chi tiết câu hỏi");
      const data: CauHoiDetail = await res.json();

      const chuong = chuongList.find((c) => c.id === data.cauHoi.idChuong);
      const tenChuong = chuong ? chuong.tenChuong : `Chương ${data.cauHoi.idChuong}`;

      setSelectedCauHoi({ ...data, tenChuong });
      setOpenDetail(true);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết:", error);
      alert("Không thể tải chi tiết câu hỏi!");
    } finally {
      setLoadingDetail(false);
    }
  };

  // ========== Toggle chọn câu hỏi (CHỈ đổi state, KHÔNG gọi API) ==========
  const handleToggleCauHoi = (
    idCauHoi: number,
    daCoTrongDe: boolean,
    event: React.MouseEvent
  ) => {
    event.stopPropagation(); // không mở dialog chi tiết

    if (daCoTrongDe) {
      // đang có trong đề -> chuyển sang trạng thái "sẽ xóa"
      setCauHoiDaCoTrongDe((prev) => {
        const ns = new Set(prev);
        ns.delete(idCauHoi);
        return ns;
      });
    } else {
      // chưa có trong đề -> chuyển sang trạng thái "sẽ thêm"
      setCauHoiDaCoTrongDe((prev) => {
        const ns = new Set(prev);
        ns.add(idCauHoi);
        return ns;
      });
    }
  };

  // ========== Áp dụng thay đổi khi bấm "Hoàn thành" (GỌI API 1 LẦN) ==========
  const applyChanges = async () => {
    // Tính diff
    const toAdd: number[] = [];
    const toRemoveChiTietIds: number[] = [];

    // Những id mới thêm (có trong hiện tại nhưng không có trong gốc)
    cauHoiDaCoTrongDe.forEach((id) => {
      if (!cauHoiDaCoTrongDeGoc.has(id)) toAdd.push(id);
    });

    // Những id cần xoá (có trong gốc nhưng không còn trong hiện tại)
    cauHoiDaCoTrongDeGoc.forEach((id) => {
      if (!cauHoiDaCoTrongDe.has(id)) {
        const chiTietId = mapChiTietByCauHoiId.get(id);
        if (chiTietId) toRemoveChiTietIds.push(chiTietId);
      }
    });

    // Gọi API theo diff
    // 1) Thêm
    if (toAdd.length > 0) {
      const res = await fetch("http://localhost:3000/bai-kiem-tra/chi-tiet-cau-hoi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idBaiKiemTra, mangIdCauHoi: toAdd }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Thêm câu hỏi thất bại");
      }
    }

    // 2) Xoá từng id chi tiết (BE không hỗ trợ xoá hàng loạt)
    if (toRemoveChiTietIds.length > 0) {
      await Promise.all(
        toRemoveChiTietIds.map((id) =>
          fetch(`http://localhost:3000/bai-kiem-tra/chi-tiet-cau-hoi/${id}`, {
            method: "DELETE",
          }).then(async (r) => {
            if (!r.ok) {
              const t = await r.text();
              throw new Error(t || `Xoá chi tiết ${id} thất bại`);
            }
          })
        )
      );
    }

    // Cập nhật snapshot gốc = trạng thái hiện tại sau khi lưu
    setCauHoiDaCoTrongDeGoc(new Set(cauHoiDaCoTrongDe));
  };

  // ========== Hoàn thành: lưu rồi quay lại ==========
const handleComplete = async () => {
  try {
    await applyChanges();
    setMessage("Lưu thay đổi thành công!");
    setOpenMessage(true);
  } catch (err: any) {
    console.error(err);
    setMessage("Lưu thay đổi thất bại: " + (err?.message || "Không rõ lỗi"));
    setOpenMessage(true);
  }
};


  // ========== Cảnh báo đóng tab nếu có thay đổi ==========
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cauHoiDaCoTrongDe, cauHoiDaCoTrongDeGoc]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton onClick={handleBack}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5">Chọn câu hỏi từ ngân hàng</Typography>
      </Box>

      <Box sx={{ backgroundColor: "white", p: 3, borderRadius: 2, mb: 3 }}>
        <Box
          sx={{
            flexDirection: "row",
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
            mb: 3,
          }}
        >
          <Typography sx={{ fontWeight: "bold", fontSize: "18px" }}>
            Môn học:
          </Typography>
          <Box
            sx={{
              backgroundColor: "rgba(255, 0, 0, 0.04)",
              borderRadius: "10px",
              height: "30px",
              px: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography
              sx={{ color: "rgba(255, 0, 0, 1)", fontWeight: "bold", fontSize: "18px" }}
            >
              {tenMonHoc}
            </Typography>
          </Box>
          <Typography sx={{ fontWeight: "bold", fontSize: "18px" }}>→</Typography>
          <Box
            sx={{
              backgroundColor: "rgba(0, 124, 213, 0.1)",
              borderRadius: "10px",
              height: "30px",
              px: 2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Typography sx={{ color: "#007CD5", fontWeight: "bold", fontSize: "18px" }}>
              {tenBaiKiemTra}
            </Typography>
          </Box>
          <Typography sx={{ fontWeight: "bold", fontSize: "18px" }}>
            → Ngân hàng câu hỏi
          </Typography>
        </Box>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Chọn chương</InputLabel>
          <Select
            value={selectedChuong}
            onChange={(e) => setSelectedChuong(e.target.value as number)}
            label="Chọn chương"
          >
            {chuongList.map((chuong) => (
              <MenuItem key={chuong.id} value={chuong.id}>
                {chuong.tenChuong}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {loading && <Typography>Đang tải câu hỏi...</Typography>}

        {!loading && cauHoiList.length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
            Chương này chưa có câu hỏi nào
          </Typography>
        )}

        <Stack spacing={2}>
          {cauHoiList.map((cauHoi) => {
            const daCoTrongDe = cauHoiDaCoTrongDe.has(cauHoi.id);

            return (
              <Card
                key={cauHoi.id}
                sx={{
                  border: daCoTrongDe ? "2px solid #4caf50" : "1px solid #ddd",
                  borderRadius: 2,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  "&:hover": {
                    boxShadow: 3,
                    transform: "translateY(-2px)",
                  },
                }}
                onClick={() => handleViewDetail(cauHoi.id)}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                        <Typography variant="h6" sx={{ fontSize: 16, fontWeight: "medium" }}>
                          {cauHoi.tenHienThi}
                        </Typography>
                        {daCoTrongDe && (
                          <Chip label="Đã thêm" size="small" color="success" sx={{ height: 24 }} />
                        )}
                      </Stack>

                      <Stack direction="row" spacing={2}>
                        <Chip
                          label={
                            cauHoi.loaiCauHoi === "MotDung" ? "Một đáp án" : "Nhiều đáp án"
                          }
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={cauHoi.doKho === "De" ? "Dễ" : "Khó"}
                          size="small"
                          variant="outlined"
                          color={cauHoi.doKho === "De" ? "success" : "error"}
                        />
                      </Stack>
                    </Box>

                    <Button
                      variant={daCoTrongDe ? "outlined" : "contained"}
                      color={daCoTrongDe ? "error" : "primary"}
                      onClick={(e) => handleToggleCauHoi(cauHoi.id, daCoTrongDe, e)}
                      sx={{
                        minWidth: 120,
                        backgroundColor: daCoTrongDe ? "transparent" : "#245D51",
                      }}
                    >
                      {daCoTrongDe ? "Bỏ chọn" : "Chọn thêm"}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>

        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button onClick={handleBack}>Quay lại</Button>
        <Button variant="contained" sx={{ backgroundColor: "#245D51" }} onClick={handleComplete}>
          Hoàn thành
        </Button>
      </Box>

      {/* Dialog chi tiết câu hỏi */}
      <Dialog open={openDetail} onClose={() => setOpenDetail(false)} maxWidth="md" fullWidth>
        <Box sx={{ backgroundColor: "#245D51" }}>
          <DialogTitle sx={{ color: "white" }}>
            Chi tiết câu hỏi
            <Button
              onClick={() => setOpenDetail(false)}
              sx={{ position: "absolute", right: 8, top: 8, minWidth: "auto", color: "white" }}
            >
              <CloseIcon />
            </Button>
          </DialogTitle>
        </Box>

        <DialogContent dividers>
          {loadingDetail && <Typography>Đang tải...</Typography>}

          {!loadingDetail && selectedCauHoi && (
            <Stack spacing={2}>
              <Typography variant="h6">{selectedCauHoi.cauHoi.tenHienThi}</Typography>

              <Typography variant="subtitle2" color="text.secondary">
                Thông tin:
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap">
                <Typography variant="body2">
                  <strong>Loại:</strong>{" "}
                  {selectedCauHoi.cauHoi.loaiCauHoi === "MotDung"
                    ? "Một đáp án"
                    : "Nhiều đáp án"}
                </Typography>
                <Typography variant="body2">
                  <strong>Độ khó:</strong>{" "}
                  {selectedCauHoi.cauHoi.doKho === "De" ? "Dễ" : "Khó"}
                </Typography>
                <Typography variant="body2">
                  <strong>Chương:</strong>{" "}
                  {selectedCauHoi.tenChuong || selectedCauHoi.cauHoi.idChuong}
                </Typography>
              </Stack>

              <Box>
                <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>
                  Nội dung câu hỏi:
                </Typography>
                <Box
                  sx={{
                    border: "1px solid #e0e0e0",
                    borderRadius: 1,
                    padding: 2,
                    backgroundColor: "#fafafa",
                    "& p.ql-align-center": { textAlign: "center" },
                    "& p.ql-align-right": { textAlign: "right" },
                    "& p.ql-align-left": { textAlign: "left" },
                    "& strong": { fontWeight: "bold" },
                    "& em": { fontStyle: "italic" },
                    "& u": { textDecoration: "underline" },
                    "& img": { maxWidth: "100%", height: "auto", borderRadius: 1 },
                    whiteSpace: "pre-wrap",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: (() => {
                      let html = selectedCauHoi.cauHoi.noiDungCauHoiHTML || "";
                      const files = selectedCauHoi.mangFileDinhKem || [];

                      // thay tất cả img có data-file-index
                      html = html.replace(
                        /<img[^>]*data-file-index="(\d+)"[^>]*>/g,
                        (match, idx) => {
                          const file = files[parseInt(idx)];
                          if (file) return match.replace(/src="[^"]*"/, `src="${file.duongDan}"`);
                          return match;
                        }
                      );
                      return html;
                    })(),
                  }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                  Các đáp án:
                </Typography>
                <Stack spacing={1}>
                  {selectedCauHoi.mangDapAn &&
                    selectedCauHoi.mangDapAn.map((ans) => {
                      const ansHtml = ans.noiDungHTML || ans.noiDung || "";
                      return (
                        <Box
                          key={ans.id}
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            padding: 1,
                            borderRadius: 1,
                            border: "1px solid #ddd",
                            backgroundColor: ans.dapAnDung ? "#e6f4ea" : "#fff",
                            "& strong": { fontWeight: "bold" },
                            "& em": { fontStyle: "italic" },
                            "& u": { textDecoration: "underline" },
                            "& p.ql-align-center": { textAlign: "center" },
                            "& p.ql-align-right": { textAlign: "right" },
                            "& p.ql-align-left": { textAlign: "left" },
                            "& img": { maxWidth: "100%", height: "auto", borderRadius: 1 },
                          }}
                          dangerouslySetInnerHTML={{ __html: ansHtml }}
                        />
                      );
                    })}
                </Stack>
              </Box>
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDetail(false)} variant="contained" sx={{ backgroundColor: "#245D51" }}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
      {/* Dialog confirm khi quay lại */}
<Dialog open={openConfirmBack} onClose={() => setOpenConfirmBack(false)}>
  <DialogTitle>Xác nhận</DialogTitle>
  <DialogContent>
    <Typography>Bạn có thay đổi chưa lưu. Bỏ thay đổi và quay lại?</Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenConfirmBack(false)}>Hủy</Button>
    <Button onClick={confirmBack} color="error" variant="contained">Đồng ý</Button>
  </DialogActions>
</Dialog>

{/* Dialog thông báo kết quả */}
<Dialog open={openMessage} onClose={() => setOpenMessage(false)}>
  <DialogTitle>Thông báo</DialogTitle>
  <DialogContent>
    <Typography>{message}</Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenMessage(false)} autoFocus>Xác nhận</Button>
  </DialogActions>
</Dialog>

    </Container>
  );
}

import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Divider,
  Chip,
} from "@mui/material";
import dayjs from "dayjs";
import { BaiLamSinhVienApi } from "../../services/bai-lam-sinh-vien.api";

interface BaiKiemTra {
  id: number;
  tenBaiKiemTra: string;
  loaiKiemTra: string; // "BaiKiemTra" | "LuyenTap"
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  thoiGianLam: number; // seconds
  soLanLam: number;
  xemBaiLam?: boolean;
  hienThiKetQua?: boolean;
}

type TrangThai = "chuaBatDau" | "dangDienRa" | "daKetThuc" | "";

const CollegeTestDetail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const baiKiemTra =
    location.state as BaiKiemTra | undefined;

  const [trangThai, setTrangThai] = useState<TrangThai>("");
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [loadingView, setLoadingView] = useState<number | null>(null);

  useEffect(() => {
    if (!baiKiemTra) return;
    const now = dayjs();
    const batDau = dayjs(baiKiemTra.thoiGianBatDau);
    const ketThuc = dayjs(baiKiemTra.thoiGianKetThuc);

    if (now.isBefore(batDau)) setTrangThai("chuaBatDau");
    else if (now.isAfter(ketThuc)) setTrangThai("daKetThuc");
    else setTrangThai("dangDienRa");
  }, [baiKiemTra]);

  const fetchAttempts = async () => {
    if (!baiKiemTra?.id) return;
    try {
      setLoadingAttempts(true);
      const list = await BaiLamSinhVienApi.layBaiLamSinhVien(
        baiKiemTra.id
      );
      setAttempts(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("layBaiLamSinhVien error:", e);
      setAttempts([]);
    } finally {
      setLoadingAttempts(false);
    }
  };

  useEffect(() => {
    void fetchAttempts();
  }, [baiKiemTra?.id]);

  const attemptsSorted = useMemo(
    () =>
      [...attempts].sort(
        (a, b) =>
          new Date(
            b.update_at ?? b.thoiGianketThuc ?? b.thoiGianBatDau ?? 0
          ).getTime() -
          new Date(
            a.update_at ?? a.thoiGianketThuc ?? a.thoiGianBatDau ?? 0
          ).getTime()
      ),
    [attempts]
  );

  const isLuyenTap = baiKiemTra?.loaiKiemTra === "LuyenTap";

  const reachedAttemptLimit = useMemo(() => {
    if (!baiKiemTra) return false;
    if (isLuyenTap) return false; // luyện tập: không giới hạn
    const completedAttempts = attempts.filter(
      (att) => att.thoiGianketThuc
    );
    // bài kiểm tra: ví dụ giới hạn 1 lần
    return completedAttempts.length >= 1;
  }, [attempts, isLuyenTap, baiKiemTra]);

  const formatDuration = (start?: string, end?: string) => {
    const startMs = start ? new Date(start).getTime() : NaN;
    const endMs = end ? new Date(end).getTime() : Date.now();
    if (!Number.isFinite(startMs)) return "-";
    const total = Math.max(0, Math.floor((endMs - startMs) / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${h}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  const handleLamBai = async () => {
    if (!baiKiemTra) return;
    if (reachedAttemptLimit) return;

    try {
      const baiLamMoi = await BaiLamSinhVienApi.taoBaiLam(
        baiKiemTra.id
      );
      navigate(`/quizzcenter/lam-bai/${baiKiemTra.id}`, {
        state: { baiKiemTra, baiLamMoi },
      });
    } catch (e: any) {
      console.error("Tạo bài làm thất bại:", e);
      alert(e?.response?.data?.message || "Có lỗi xảy ra khi tạo bài làm!");
    }
  };

  const handleQuayLaiLam = async (attId: number) => {
    if (!baiKiemTra) return;
    try {
      const tiepTuc = await BaiLamSinhVienApi.tiepTucLamBai(attId);
      navigate(`/quizzcenter/lam-bai/${baiKiemTra.id}`, {
        state: { baiKiemTra, baiLamMoi: tiepTuc },
      });
    } catch (e: any) {
      console.error("Tiếp tục làm bài thất bại:", e);
      if (e.response?.status === 404) {
        alert(
          "Bài làm này không tồn tại hoặc đã được nộp. Không thể tiếp tục."
        );
      } else {
        alert(
          e?.response?.data?.message ||
            "Có lỗi xảy ra khi tiếp tục làm bài!"
        );
      }
    }
  };

  const handleXemBaiLam = async (idBaiLam: number) => {
    try {
      setLoadingView(idBaiLam);
      const xemLaiData =
        await BaiLamSinhVienApi.xemLaiBaiLam(idBaiLam);
      navigate(`/quizzcenter/xem-lai/${idBaiLam}`, {
        state: { xemLaiData },
      });
    } catch (e) {
      console.error("xemLaiBaiLam error:", e);
      navigate(`/quizzcenter/xem-lai/${idBaiLam}`);
    } finally {
      setLoadingView(null);
    }
  };

  if (!baiKiemTra) {
    return <Typography>Không tìm thấy thông tin bài kiểm tra.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, color: "#e91e63" }}
        >
          {baiKiemTra.tenBaiKiemTra}
        </Typography>
        <Box
          sx={{
            mt: 1.5,
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Chip
            label={isLuyenTap ? "Luyện tập" : "Bài kiểm tra"}
            color={isLuyenTap ? "warning" : "primary"}
            size="small"
          />
        </Box>

        <Typography sx={{ mt: 2 }}>
          <strong>Bắt đầu:</strong>{" "}
          {dayjs(baiKiemTra.thoiGianBatDau).format(
            "HH:mm DD/MM/YYYY"
          )}
        </Typography>
        <Typography>
          <strong>Kết thúc:</strong>{" "}
          {dayjs(baiKiemTra.thoiGianKetThuc).format(
            "HH:mm DD/MM/YYYY"
          )}
        </Typography>
        {baiKiemTra.thoiGianLam && (
          <Typography>
            <strong>Thời gian làm:</strong>{" "}
            {Math.floor(baiKiemTra.thoiGianLam / 60)} phút
          </Typography>
        )}
        {isLuyenTap && (
          <Typography>
            <strong>Số lần làm:</strong> Không giới hạn
          </Typography>
        )}
      </Paper>

      {/* Trạng thái khung giờ + nút */}
      {trangThai === "chuaBatDau" && (
        <Typography
          sx={{ color: "orange", fontWeight: 600, mb: 2 }}
        >
          ❌ Bài kiểm tra chưa đến thời gian bắt đầu
        </Typography>
      )}
      {trangThai === "daKetThuc" && (
        <Typography
          sx={{ color: "red", fontWeight: 600, mb: 2 }}
        >
          ⏰ Đã hết thời gian làm bài
        </Typography>
      )}

      {trangThai === "dangDienRa" && !reachedAttemptLimit && (
        <Button
          variant="contained"
          color="success"
          onClick={handleLamBai}
          size="large"
          sx={{ mb: 2, py: 1.2, px: 4, fontWeight: 600 }}
        >
          Làm bài ngay
        </Button>
      )}
      {trangThai === "dangDienRa" &&
        reachedAttemptLimit &&
        !isLuyenTap && (
          <Typography
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              mb: 2,
            }}
          >
            Bạn đã hết lượt làm bài kiểm tra này.
          </Typography>
        )}

      {/* Danh sách bài làm */}
      <Paper sx={{ p: 0, overflow: "hidden" }}>
        <Box
          sx={{
            px: 2,
            py: 1.5,
            fontWeight: 700,
            display: "grid",
            gridTemplateColumns: isLuyenTap
              ? "2fr 1.2fr 1.4fr"
              : "2fr 1.2fr 1.4fr 1.4fr",
            gap: 2,
            backgroundColor: "#f5f5f5",
          }}
        >
          <span>Ngày làm</span>
          <span>Kết quả</span>
          {!isLuyenTap && <span>Thời gian làm bài</span>}
        </Box>

        <Divider />

        {loadingAttempts ? (
          <Box
            sx={{
              p: 3,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <CircularProgress size={20} /> Đang tải danh sách bài
            làm…
          </Box>
        ) : attemptsSorted.length === 0 ? (
          <Box sx={{ p: 3, color: "text.secondary" }}>
            Chưa có bài làm nào.
          </Box>
        ) : (
          attemptsSorted.map((att) => {
            const ngay = dayjs(att.thoiGianBatDau).format(
              "HH:mm DD/MM/YYYY"
            );
            const diemText =
              typeof att.tongDiem === "number"
                ? `${Number(att.tongDiem).toFixed(2)}/10`
                : "—";

            const isDangLam = !att.thoiGianketThuc;
            const durationText =
              !isLuyenTap && !isDangLam
                ? formatDuration(
                    att.thoiGianBatDau,
                    att.thoiGianketThuc
                  )
                : !isLuyenTap && isDangLam
                ? "Đang làm"
                : "";

            return (
              <Box
                key={att.id}
                sx={{
                  px: 2,
                  py: 1.5,
                  display: "grid",
                  gridTemplateColumns: isLuyenTap
                    ? "2fr 1.2fr 1.4fr"
                    : "2fr 1.2fr 1.4fr 1.4fr",
                  gap: 2,
                  alignItems: "center",
                  "&:not(:last-of-type)": {
                    borderBottom: "1px solid #eee",
                  },
                  backgroundColor: isDangLam
                    ? "#fff3e0"
                    : "transparent",
                }}
              >
                {/* Ngày làm */}
                <Typography sx={{ fontWeight: 600 }}>
                  {ngay}
                  {isDangLam && (
                    <Chip
                      label="Đang làm"
                      color="warning"
                      size="small"
                      sx={{
                        ml: 1,
                        fontSize: "0.7rem",
                      }}
                    />
                  )}
                </Typography>

                {/* Kết quả */}
                <Typography sx={{ fontWeight: 600 }}>
                  {diemText}
                </Typography>

                {/* Thời gian làm bài (chỉ bài kiểm tra) */}
                {!isLuyenTap && (
                  <Typography>{durationText}</Typography>
                )}

                {/* Hành động */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 1,
                  }}
                >
                  {isDangLam ? (
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={() => handleQuayLaiLam(att.id)}
                      sx={{ fontWeight: 600 }}
                    >
                      Tiếp tục làm bài
                    </Button>
                  ) : (
                    baiKiemTra.loaiKiemTra !== "BaiKiemTra" && (
                      <Button
                        variant="outlined"
                        onClick={() => handleXemBaiLam(att.id)}
                        disabled={loadingView === att.id}
                        sx={{ fontWeight: 600 }}
                      >
                        {loadingView === att.id
                          ? "Đang mở…"
                          : "Xem chi tiết"}
                      </Button>
                    )
                  )}
                </Box>
              </Box>
            );
          })
        )}
      </Paper>
    </Box>
  );
};

export default CollegeTestDetail;

// src/pages/XemLaiBaiLamPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, Paper, Chip, CircularProgress, Alert, Checkbox, FormControlLabel
} from "@mui/material";
import { BaiLamSinhVienApi } from "../../api/bai-lam-sinh-vien.api";

interface DapAnReview {
  id: number;
  noiDung: string;    // HTML
  isCorrect: boolean;
  selected: boolean;
}
interface CauHoiReview {
  idChiTietBaiLam: number;
  idCauHoiBaiKiemTra: number;
  cauHoi: {
    id: number;
    tenHienThi: string;
    noiDung: string;  // HTML
    loai: string;
  } | null;
  daChon: number[];
  dapAn: DapAnReview[];
}

interface XemLaiPayload {
  baiLam: {
    id: number;
    idSinhVien: number;
    idBaiKiemTra: number;
    trangThai: "DaNop" | string;
    tongDiem: number | string | null;
    diemTinhLai: number;
    thoiGianBatDau: string;
    thoiGianketThuc: string;
  };
  thongKe: {
    tongCau: number;
    tongDapAnDung: number;
    tongDapAnToanBo: number;
    diemThang10: number;
  };
  chiTiet: CauHoiReview[];
}

const XemLaiBaiLamPage: React.FC = () => {
  const { idBaiLam } = useParams<{ idBaiLam: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<XemLaiPayload | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!idBaiLam) return;
      try {
        setLoading(true);
        const res: XemLaiPayload = await BaiLamSinhVienApi.xemLaiBaiLam(Number(idBaiLam));
        setData(res);
      } catch (e: any) {
        console.error("xemLai error:", e);
        alert(e?.response?.data?.message || "Không thể xem lại bài làm");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [idBaiLam, navigate]);

  if (loading) {
    return (
      <Box sx={{ minHeight: "50vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!data) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Không có dữ liệu!</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1100, mx: "auto" }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Kết quả bài làm #{data.baiLam.id}
        </Typography>
        <Typography>
          Điểm : <b>{typeof data.baiLam.tongDiem === "string" ? Number(data.baiLam.tongDiem) : data.baiLam.tongDiem ?? 0}</b> 

        </Typography>
        <Typography>
          Thời gian: {new Date(data.baiLam.thoiGianBatDau).toLocaleString()} →{" "}
          {new Date(data.baiLam.thoiGianketThuc).toLocaleString()}
        </Typography>
        <Typography>
          Tổng câu: {data.thongKe.tongCau} câu | Đúng {data.thongKe.tongDapAnDung}/{data.thongKe.tongDapAnToanBo} đáp án đúng
        </Typography>
      </Paper>

      {data.chiTiet.map((item, idx) => (
        <Paper key={item.idChiTietBaiLam ?? `${item.idCauHoiBaiKiemTra}-${idx}`} sx={{ p: 3, mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 1 }}>
            <Chip label={`Câu ${idx + 1}`} color="primary" />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {item.cauHoi?.tenHienThi}
            </Typography>
          </Box>

          <Typography
            variant="body1"
            sx={{ mb: 2 }}
            dangerouslySetInnerHTML={{ __html: item.cauHoi?.noiDung ?? "" }}
          />

          {item.dapAn.map((da) => (
            <Box
              key={da.id}
              sx={{
                border: "1px solid #e0e0e0",
                borderRadius: 1,
                p: 1,
                mb: 1,
                backgroundColor: da.isCorrect ? "#E8F5E9" : da.selected ? "#FFF3E0" : "transparent",
              }}
            >
              <FormControlLabel
                control={<Checkbox checked={da.selected} disabled />}
                label={<span dangerouslySetInnerHTML={{ __html: da.noiDung }} />}
              />
              {da.isCorrect && (
                <Chip size="small" label="Đáp án đúng" color="success" sx={{ ml: 1 }} />
              )}
              {!da.isCorrect && da.selected && (
                <Chip size="small" label="Bạn chọn" color="warning" sx={{ ml: 1 }} />
              )}
            </Box>
          ))}
        </Paper>
      ))}
    </Box>
  );
};

export default XemLaiBaiLamPage;

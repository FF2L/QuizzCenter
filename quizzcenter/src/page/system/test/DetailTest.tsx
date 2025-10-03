// BaiKiemTraDetail.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Stack,
  Typography,
  Button,
  Card,
  CardContent,
  Pagination,
} from "@mui/material";
import { BaiKiemTra, CauHoiPayload } from "../../../common/model";

const BaiKiemTraDetail: React.FC = () => {
  const { idBaiKiemTra } = useParams<{ idBaiKiemTra: string }>();
  const [bai, setBai] = useState<BaiKiemTra | null>(null);
  const [cauHoiList, setCauHoiList] = useState<CauHoiPayload[]>([]);
  const [page, setPage] = useState(1);
  const limit = 5;

  // fetch chi tiết bài kiểm tra
  useEffect(() => {
    const fetchDetail = async () => {
      if (!idBaiKiemTra) return;
      const res = await fetch(
        `http://localhost:3000/bai-kiem-tra/findone/${idBaiKiemTra}`
      );
      const data = await res.json();
      setBai(data);
    };
    fetchDetail();
  }, [idBaiKiemTra]);

  // fetch câu hỏi
  useEffect(() => {
    const fetchCauHoi = async () => {
      if (!idBaiKiemTra) return;
      const skip = (page - 1) * limit;
      const res = await fetch(
        `http://localhost:3000/bai-kiem-tra/chi-tiet-cau-hoi/${idBaiKiemTra}?loaiKiemTra=LuyenTap&xemBaiLam=true&hienThiKetQua=true&skip=${skip}&limit=${limit}`
      );
      const data: CauHoiPayload[] = await res.json();
      setCauHoiList(data);
    };
    fetchCauHoi();
  }, [idBaiKiemTra, page]);

  return (
    <Box sx={{ p: 3 }}>
      {bai && (
        <>
          {/* Header */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h4">{bai.tenBaiKiemTra}</Typography>
            <Button variant="contained" color="primary">
              Thêm câu hỏi
            </Button>
          </Stack>

          {/* Thông tin */}
          <Stack direction="row" spacing={4} mb={3}>
            <Typography>Loại: {bai.loaiKiemTra}</Typography>
            <Typography>Số lần làm: {bai.soLanLam}</Typography>
            <Typography>
              Thời gian: {new Date(bai.thoiGianBatDau).toLocaleString()} -{" "}
              {new Date(bai.thoiGianKetThuc).toLocaleString()}
            </Typography>
            <Typography>Thời gian làm: {bai.thoiGianLam / 60} phút</Typography>
          </Stack>

          {/* Danh sách câu hỏi */}
          <Stack spacing={2}>
            {cauHoiList.map((item) => (
              <Card key={item.cauHoi.id}>
                <CardContent>
                  <Typography variant="h6">
                    {item.cauHoi.tenHienThi}
                  </Typography>
                  <Typography>{item.cauHoi.noiDungCauHoi}</Typography>
                  {/* render đáp án nếu muốn */}
                  {item.dapAn.map((da) => (
                    <Typography key={da.id} sx={{ ml: 2 }}>
                      - {da.noiDung} {da.dapAnDung ? "(Đúng)" : ""}
                    </Typography>
                  ))}
                </CardContent>
              </Card>
            ))}
          </Stack>

          {/* Phân trang */}
          <Box mt={3}>
            <Pagination
              count={10} // TODO: thay bằng tổng số trang từ BE
              page={page}
              onChange={(_, value) => setPage(value)}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default BaiKiemTraDetail;

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
  Menu,
  MenuItem,
} from "@mui/material";
import { BaiKiemTra, CauHoiPayload } from "../../../common/model";

const BaiKiemTraDetail: React.FC = () => {
  const { idBaiKiemTra } = useParams<{ idBaiKiemTra: string }>();
  const [bai, setBai] = useState<BaiKiemTra | null>(null);
  const [cauHoiList, setCauHoiList] = useState<CauHoiPayload[]>([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const limit = 5;

  // menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // fetch chi tiết bài kiểm tra
  useEffect(() => {
    const fetchDetail = async () => {
      if (!idBaiKiemTra) return;
      try {
        const res = await fetch(
          `http://localhost:3000/bai-kiem-tra/findone/${idBaiKiemTra}`
        );
        if (!res.ok) throw new Error("Không tìm thấy bài kiểm tra");
        const data: BaiKiemTra = await res.json();
        setBai(data);
      } catch (err) {
        console.error("Lỗi fetch bài kiểm tra:", err);
      }
    };
    fetchDetail();
  }, [idBaiKiemTra]);

  // fetch câu hỏi
  useEffect(() => {
    const fetchCauHoi = async () => {
      if (!idBaiKiemTra || !bai) return;
      const skip = (page - 1) * limit;
      try {
        const res = await fetch(
          `http://localhost:3000/bai-kiem-tra/chi-tiet-cau-hoi/${idBaiKiemTra}?loaiKiemTra=${bai.loaiKiemTra}&xemBaiLam=${bai.xemBaiLam}&hienThiKetQua=${bai.hienThiKetQua}&skip=${skip}&limit=${limit}`
        );
        if (!res.ok) throw new Error("Không tìm thấy câu hỏi");
        const data = await res.json();

        if (data.items && data.total) {
          setCauHoiList(data.items);
          setTotalPage(Math.ceil(data.total / limit));
        } else {
          setCauHoiList(data);
          setTotalPage(1);
        }
      } catch (err) {
        console.error("Lỗi fetch câu hỏi:", err);
      }
    };
    fetchCauHoi();
  }, [idBaiKiemTra, page, bai]);

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
            <div>
              <Button
                variant="contained"
                color="primary"
                onClick={handleClick}
              >
                Thêm câu hỏi
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
              >
                <MenuItem onClick={() => { handleClose(); alert("Tạo bằng tay"); }}>
                  Tạo bằng tay
                </MenuItem>
                <MenuItem onClick={() => { handleClose(); alert("Ngân hàng câu hỏi"); }}>
                  Ngân hàng câu hỏi
                </MenuItem>
                <MenuItem onClick={() => { handleClose(); alert("Excel"); }}>
                  Excel
                </MenuItem>
              </Menu>
            </div>
          </Stack>

          {/* Thông tin */}
          <Stack direction="row" spacing={4} mb={3}>
            <Typography>Loại: {bai.loaiKiemTra}</Typography>
            <Typography>Số lần làm: {bai.soLanLam}</Typography>
            <Typography>
              Thời gian:{" "}
              {new Date(bai.thoiGianBatDau).toLocaleString()} -{" "}
              {new Date(bai.thoiGianKetThuc).toLocaleString()}
            </Typography>
            <Typography>Thời gian làm: {bai.thoiGianLam / 60} phút</Typography>
          </Stack>

          {/* Danh sách câu hỏi */}
          <Stack spacing={2}>
            {cauHoiList.map((item: any) => (
              <Card key={item.id}>
                <CardContent>
                  <Typography variant="h6">
                    {item.__cauHoi__?.tenHienThi}
                  </Typography>
                  <Typography>
                    {item.__cauHoi__?.noiDungCauHoi}
                  </Typography>

                  {item.dapAn?.map((da: any) => (
                    <Typography key={da.id} sx={{ ml: 2 }}>
                      - {da.noiDung} {da.dapAnDung ? "(Đúng)" : ""}
                    </Typography>
                  ))}

                  <Stack direction="row" spacing={2} mt={1}>
                    <Typography>Loại: {item.__cauHoi__?.loaiCauHoi}</Typography>
                    <Typography>Độ khó: {item.__cauHoi__?.doKho}</Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>

          {/* Phân trang */}
          <Box mt={3}>
            <Pagination
              count={totalPage}
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

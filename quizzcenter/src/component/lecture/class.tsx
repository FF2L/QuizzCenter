// Class.tsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import CategoryIcon from "@mui/icons-material/Category";
import SearchIcon from "@mui/icons-material/Search";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { LopHocPhan } from "../../common/model"; // import model LopHocPhan

const LectureClass = () => {
  const { idMonHoc } = useParams<{ idMonHoc: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { tenMonHoc } = location.state || {};

  const [lopHocPhanList, setLopHocPhanList] = useState<LopHocPhan[]>([]);
  const [loading, setLoading] = useState(false);

  const idMonHocNumber = Number(idMonHoc);
  const idGiangVien = 2; // hardcode cho ví dụ, về sau truyền động

  useEffect(() => {
    const fetchLopHocPhan = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:3000/lop-hoc-phan/${idMonHocNumber}?idGiangVien=${idGiangVien}`
        );
        const data: LopHocPhan[] = await res.json();
        // lọc theo thời gian kết thúc >= hiện tại
        const now = new Date();
        const filtered = data.filter(
          (lop) => new Date(lop.thoiGianKetThuc) >= now
        );
        setLopHocPhanList(filtered);
      } catch (error) {
        console.error("Lỗi fetch lớp học phần:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLopHocPhan();
  }, [idMonHocNumber]);

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        borderRadius: "10px",
      }}
    >
      <Box
  sx={{
    display: "flex",
    alignItems: "center",
    mb: 2,
    backgroundColor: "#f9f9f9",
    p: 1.5,
    borderRadius: 2,
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  }}
>
  <Breadcrumbs
    aria-label="breadcrumb"
    separator="›"
    sx={{
      color: "#555",
      "& .MuiTypography-root": { fontSize: 15 },
    }}
  >
    <Typography sx={{ color: "#666" }}>
      Môn học (
      <span style={{ color: "#e91e63", fontWeight: 600 }}>{tenMonHoc}</span>
      )
    </Typography>

    <Typography sx={{ fontWeight: 600, color: "#000" }}>
      Lớp học phần
    </Typography>
  </Breadcrumbs>
</Box>
<Typography variant="h3" sx={{ fontWeight: "medium", fontSize: "30px", color: "black", mt:10 }}>
               Lớp học của tôi
            </Typography>   
      <Stack spacing={3}>
        {/* Header */} 
        <Box sx={{ display: "flex", flexWrap: "wrap" }}>
        <Autocomplete
              options={[]}
              sx={{
                width: "300px",
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  height: "50px",
                },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Tìm kiếm lớp học phần ..."
                  sx={{
                    "& .MuiInputBase-input": {
                      color: "black",
                      fontSize: "16px",
                      fontWeight: "medium",
                      fontFamily: "Poppins",
                    },
                  }}
                />
              )}
            />
          </Box>
        {/* Danh sách lớp học phần */}
        <Stack spacing={2}>
          {loading && <Typography>Đang tải...</Typography>}
          {!loading && lopHocPhanList.length === 0 && (
            <Typography>Chưa có lớp học phần nào.</Typography>
          )}
          {!loading &&
            lopHocPhanList.map((lop) => (
              <Card
                key={lop.id}
                onClick={() =>
                  navigate(`/lop-hoc-phan/bai-kiem-tra/${lop.id}`, { state: { tenLopHoc: lop.tenLopHoc,tenMonHoc  } })
                }
              >
                <CardContent sx={{ padding: 10, backgroundColor: "white" }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack>
                      <Typography sx={{ fontSize: "20px", fontWeight: "medium", color: "black" }}>
                        {lop.tenLopHoc}
                      </Typography>
                      <Stack spacing={10} display="flex" direction="row">
                      <Typography sx={{ fontSize: "14px", color: "#a5a5a5" }}>
                        Ngày bắt đầu: {new Date(lop.thoiGianBatDau).toLocaleDateString()}
                      </Typography>
                      <Typography sx={{ fontSize: "14px", color: "#a5a5a5" }}>
                        Ngày kết thúc: {new Date(lop.thoiGianKetThuc).toLocaleDateString()}
                      </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
        </Stack>
      </Stack>
    </Box>
  );
};

export default LectureClass;
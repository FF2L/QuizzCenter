// Class.tsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import CategoryIcon from "@mui/icons-material/Category";
import SearchIcon from "@mui/icons-material/Search";
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
import { LopHocPhan } from "../../../common/model"; // import model LopHocPhan

const Class = () => {
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
        backgroundColor: "#F2F2F2",
        borderRadius: "10px",
        padding: 2,
      }}
    >
      <Stack spacing={3}>
        {/* Search */}
        <Stack direction="row" spacing={-1} alignItems="center" justifyContent="center">
          <Box sx={{ mt: "20px", display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Autocomplete
              options={[]}
              sx={{
                mt: "50px",
                width: "350px",
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  height: "45px",
                  "& fieldset": { border: "none" },
                },
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Tìm kiếm lớp học phần ..."
                  sx={{
                    "& .MuiInputBase-input": {
                      color: "#959595",
                      fontSize: "16px",
                      fontWeight: "medium",
                      fontFamily: "Poppins",
                    },
                  }}
                />
              )}
            />
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              sx={{
                backgroundColor: "#245d51",
                mt: "50px",
                height: "45px",
                width: "130px",
                fontSize: "16px",
                fontWeight: "medium",
                boxShadow: "none",
                textTransform: "none",
                "&:hover": { backgroundColor: "#1a4a3e" },
              }}
            >
              Tìm kiếm
            </Button>
          </Box>
        </Stack>

        {/* Header */}
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ width: "50px", height: "50px", backgroundColor: "#245d51", borderRadius: "32px" }}>
              <CategoryIcon sx={{ fontSize: 40, color: "white" }} />
            </Box>
            <Typography variant="h3" sx={{ fontWeight: "medium", fontSize: "30px", color: "black" }}>
               Lớp học của tôi
            </Typography>
            
          </Stack>

        </Stack>
        <Box sx={{ flexDirection: "row", display: "flex", alignItems: "center" }}>
          <Typography sx={{fontWeight:'bold',fontSize:"18px"}}>
            Môn học:
          </Typography>
          <Box sx={{backgroundColor:"rgba(255, 0, 0, 0.04)", borderRadius:"10px", height:"30px", width:"180px", display:"flex", justifyContent:'center', alignItems:"center"}}>
          <Typography sx={{color:"rgba(255, 0, 0, 1)", ml:1, fontWeight:'bold',fontSize:"18px"}}>{tenMonHoc}</Typography>
          </Box>
          <Typography sx={{ml:1,fontWeight:'bold',fontSize:"18px"}}> → Lớp học</Typography>
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
                sx={{ borderRadius: "20px", boxShadow: "none", cursor: "pointer" }}
                onClick={() =>
                  navigate(`/lop-hoc-phan/bai-kiem-tra/${lop.id}`, { state: { tenLopHoc: lop.tenLopHoc,tenMonHoc  } })
                }
              >
                <CardContent sx={{ padding: 2, backgroundColor: "white" }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack>
                      <Typography sx={{ fontSize: "20px", fontWeight: "medium", color: "black" }}>
                        {lop.tenLopHoc}
                      </Typography>
                      <Typography sx={{ fontSize: "14px", color: "#a5a5a5" }}>
                        Ngày bắt đầu: {new Date(lop.thoiGianBatDau).toLocaleDateString()}
                      </Typography>
                      <Typography sx={{ fontSize: "14px", color: "#a5a5a5" }}>
                        Ngày kết thúc: {new Date(lop.thoiGianKetThuc).toLocaleDateString()}
                      </Typography>
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

export default Class;

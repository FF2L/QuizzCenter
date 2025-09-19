import { Box, Button, Stack, Typography, IconButton, Menu, MenuItem } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function TestDetail() {
  const navigate = useNavigate();
  const { chapterId, testName } = useParams<{ chapterId: string; testName: string }>();
  const decodedTestName = testName ? decodeURIComponent(testName) : "Bài kiểm tra";

  const [questions, setQuestions] = useState<string[]>([]);
  const [openQuestionDialog, setOpenQuestionDialog] = useState(false);

  // Dropdown menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuSelect = (option: string) => {
    console.log("Chọn:", option);
    handleMenuClose();
    // TODO: xử lý theo option (ví dụ mở popup tạo câu hỏi)
  };

  const handleAddQuestion = (question: string) => {
    setQuestions([...questions, question]);
  };

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", backgroundColor: "#f8f8f8", borderRadius: "10px", p: 2 }}>
      <Stack spacing={3} sx={{ maxWidth: 1582, mx: "auto" }}>
        {/* Nút back góc trên bên phải */}
        <Stack direction="row" justifyContent="flex-end" sx={{ pt: 4 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              backgroundColor: "#245d51",
              color: "white",
              borderRadius: "12px",
              width: 60,
              height: 60,
              "&:hover": { backgroundColor: "#1e4d42" },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Stack>

        {/* Tên bài test */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: 24, fontWeight: 500, fontFamily: "Poppins, Helvetica" }}>
            {decodedTestName}
          </Typography>
        </Stack>

        {/* Nút thêm câu hỏi + dropdown */}
        <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#245d51",
              borderRadius: "12px",
              height: 50,
              minWidth: 200,
              fontFamily: "Poppins, Helvetica",
              fontWeight: "medium",
              fontSize: 18,
              textTransform: "none",
              "&:hover": { backgroundColor: "#1e4d42" },
            }}
            onClick={() => setOpenQuestionDialog(true)}
          >
            Thêm câu hỏi
          </Button>

          <Button
            variant="outlined"
            endIcon={<ArrowDropDownIcon />}
            sx={{
              borderRadius: "12px",
              height: 50,
              fontFamily: "Poppins, Helvetica",
              fontWeight: "medium",
              fontSize: 18,
              textTransform: "none",
              "&:hover": { backgroundColor: "rgba(36, 93, 81,0.1)" },
            }}
            onClick={handleMenuClick}
          >
            Chọn cách tạo
          </Button>
          <Menu anchorEl={anchorEl} open={openMenu} onClose={handleMenuClose}>
            <MenuItem onClick={() => handleMenuSelect("Ngân hàng câu hỏi")}>
              Tạo bằng ngân hàng câu hỏi
            </MenuItem>
            <MenuItem onClick={() => handleMenuSelect("Tạo bằng tay")}>
              Tạo bằng tay
            </MenuItem>
            <MenuItem onClick={() => handleMenuSelect("Từ Excel")}>
              Từ Excel
            </MenuItem>
          </Menu>
        </Stack>

        {/* Danh sách câu hỏi */}
        <Stack spacing={1} sx={{ pl: 2, pt: 2 }}>
          {questions.map((q, idx) => (
            <Typography key={idx} sx={{ fontFamily: "Poppins, Helvetica", fontSize: 18 }}>
              {idx + 1}. {q}
            </Typography>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}

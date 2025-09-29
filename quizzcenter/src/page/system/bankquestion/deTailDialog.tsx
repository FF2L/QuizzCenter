// QuestionDetailDialog.tsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
  Box,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import { CauHoiPayload } from "../../../common/model";

interface QuestionDetailDialogProps {
  open: boolean;
  onClose: () => void;
  questionDetail: CauHoiPayload | null;
}

const QuestionDetailDialog: React.FC<QuestionDetailDialogProps> = ({
  open,
  onClose,
  questionDetail,
}) => {
  if (!questionDetail) return null;

  const { cauHoi, dapAn, mangFileDinhKem } = questionDetail;

  // Prefer HTML field if present; fallback to plain text
  const rawHtml =
    cauHoi.noiDungCauHoiHTML && cauHoi.noiDungCauHoiHTML.trim() !== ""
      ? cauHoi.noiDungCauHoiHTML
      : cauHoi.noiDungCauHoi || "";

  // OPTIONAL: sanitize the HTML if it comes from users
  // Install: npm i dompurify @types/dompurify
  // import DOMPurify from 'dompurify';
  // const sanitizedHtml = DOMPurify.sanitize(rawHtml);
  const sanitizedHtml = rawHtml;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Chi tiết câu hỏi
        <Button
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8, minWidth: "auto" }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="h6">{cauHoi.tenHienThi}</Typography>

          <Typography variant="subtitle2" color="text.secondary">
            Thông tin:
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Typography variant="body2">Loại: {cauHoi.loaiCauHoi}</Typography>
            <Typography variant="body2">Độ khó: {cauHoi.doKho}</Typography>
            <Typography variant="body2">Chương: {cauHoi.idChuong}</Typography>
          </Stack>

          <Box>
            <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>
              Nội dung câu hỏi:
            </Typography>

            {/* container dùng dangerouslySetInnerHTML để render HTML.
                style via sx để tất cả <img> trong HTML tự co giãn */}
            <Box
              sx={{
                border: "1px solid #e0e0e0",
                borderRadius: 1,
                padding: 2,
                backgroundColor: "#fafafa",
                "& img": {
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: 1,
                },
                "& iframe": {
                  maxWidth: "100%",
                },
                whiteSpace: "pre-wrap",
              }}
              dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
            />
          </Box>

          {/* Nếu có file đính kèm (mangFileDinhKem) hiển thị */}
          {/* Nếu có file đính kèm (mangFileDinhKem) hiển thị */}
{Array.isArray(mangFileDinhKem) && mangFileDinhKem.length > 0 && (
  <Box>
    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
      Hình/Files đính kèm:
    </Typography>
    <Stack direction="row" spacing={2} flexWrap="wrap">
      {mangFileDinhKem.map((file) => (
        <Box
          key={file.id}
          component="img"
          src={file.duongDan}   // 👉 dùng duongDan trả về từ BE
          alt={file.tenFile}
          sx={{
            width: { xs: "100%", sm: "200px" },
            height: "auto",
            borderRadius: 1,
            border: "1px solid #e0e0e0",
            objectFit: "contain",
          }}
        />
      ))}
    </Stack>
  </Box>
)}


          <Box>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Các đáp án:
            </Typography>

            <Stack spacing={1}>
              {dapAn?.map((ans) => {
                const ansHtml =
                  ans.noiDungHTML && ans.noiDungHTML.trim() !== ""
                    ? ans.noiDungHTML
                    : ans.noiDung || "";

                // OPTIONAL sanitize answers too if needed
                const sanitizedAnsHtml = ansHtml;

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
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography sx={{ fontWeight: "bold" }}>
                        {ans.dapAnDung ? "Đáp án đúng" : "Đáp án"}
                      </Typography>
                      {ans.dapAnDung && (
                        <CheckCircleIcon sx={{ color: "green", fontSize: 18 }} />
                      )}
                    </Stack>

                    <Box
                      sx={{
                        mt: 1,
                        "& img": { maxWidth: "100%", height: "auto", borderRadius: 1 },
                      }}
                      dangerouslySetInnerHTML={{ __html: sanitizedAnsHtml }}
                    />
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuestionDetailDialog;

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
  Chip,
  Divider,
  Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { CauHoiPayload } from "../../../common/model";

type LoaiKey = "MotDung" | "NhieuDung";
type doKhoKey = "Kho" | "De";

const loaiMap: Record<LoaiKey, string> = {
  MotDung: "Một đáp án",
  NhieuDung: "Nhiều đáp án",
};
const doKhoMap: Record<doKhoKey, string> = {
  De: "Dễ",
  Kho: "Khó",
};

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
  const processedHtml = React.useMemo(() => {
    if (!questionDetail) return "";

    let html = questionDetail.cauHoi.noiDungCauHoiHTML || "";
    const files = questionDetail.mangFileDinhKem || [];

    html = html.replace(/<img[^>]*data-file-index="(\d+)"[^>]*>/g, (match, idx) => {
      const file = files[parseInt(idx)];
      if (file) return match.replace(/src="[^"]*"/, `src="${file.duongDan}"`);
      return match;
    });

    return html;
  }, [questionDetail]);

  if (!questionDetail) return null;
  const { cauHoi, dapAn } = questionDetail;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      {/* Header */}
      <Box sx={{ backgroundColor: "#245D51" }}>
        <DialogTitle sx={{ color: "white", fontWeight: 600 }}>
          Chi tiết câu hỏi
          <Button
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              minWidth: "auto",
              color: "white",
            }}
          >
            <CloseIcon />
          </Button>
        </DialogTitle>
      </Box>

      {/* Content */}
      <DialogContent dividers>
        <Stack spacing={3}>
          {/* Tiêu đề câu hỏi */}
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {cauHoi.tenHienThi}
          </Typography>

          {/* Thông tin chi tiết */}
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: "#f9f9f9" }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
              Thông tin chi tiết
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Chip
                label={`Loại: ${loaiMap[cauHoi.loaiCauHoi as LoaiKey] || cauHoi.loaiCauHoi}`}
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`Độ khó: ${doKhoMap[cauHoi.doKho as doKhoKey] || cauHoi.doKho}`}
                color={cauHoi.doKho === "Kho" ? "error" : "success"}
                variant="outlined"
              />
              <Chip label={`Chương: ${cauHoi.idChuong}`} variant="outlined" />
            </Stack>
          </Paper>

          {/* Nội dung câu hỏi */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
              Nội dung câu hỏi
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "#fafafa",
                "& p.ql-align-center": { textAlign: "center" },
                "& p.ql-align-right": { textAlign: "right" },
                "& p.ql-align-left": { textAlign: "left" },
                "& strong": { fontWeight: "bold" },
                "& em": { fontStyle: "italic" },
                "& u": { textDecoration: "underline" },
                "& img": { maxWidth: "100%", borderRadius: 2 },
                whiteSpace: "pre-wrap",
              }}
              dangerouslySetInnerHTML={{ __html: processedHtml }}
            />
          </Box>

          {/* Đáp án */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
              Các đáp án
            </Typography>
            <Stack spacing={1.5}>
              {dapAn?.map((ans) => {
                const ansHtml = ans.noiDungHTML || ans.noiDung || "";
                return (
                  <Paper
                    key={ans.id}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: ans.dapAnDung ? "1px solid #4caf50" : "1px solid #e0e0e0",
                      backgroundColor: ans.dapAnDung ? "#e8f5e9" : "#fff",
                      transition: "0.2s",
                      "&:hover": {
                        boxShadow: "0 0 8px rgba(0,0,0,0.1)",
                      },
                      "& p.ql-align-center": { textAlign: "center" },
                      "& img": { maxWidth: "100%", borderRadius: 2 },
                    }}
                  >
                    <Box dangerouslySetInnerHTML={{ __html: ansHtml }} />
                    {ans.dapAnDung && (
                      <Typography
                        variant="caption"
                        sx={{ color: "#388e3c", fontWeight: 500 }}
                      >
                        ✓ Đáp án đúng
                      </Typography>
                    )}
                  </Paper>
                );
              })}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: "#245D51",
            "&:hover": { backgroundColor: "#1e4a42" },
          }}
        >
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuestionDetailDialog;

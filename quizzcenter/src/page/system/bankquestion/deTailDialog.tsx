import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Stack, Box } from "@mui/material";
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

const QuestionDetailDialog: React.FC<QuestionDetailDialogProps> = ({ open, onClose, questionDetail }) => {
  const processedHtml = React.useMemo(() => {
    if (!questionDetail) return "";

    let html = questionDetail.cauHoi.noiDungCauHoiHTML || "";
    const files = questionDetail.mangFileDinhKem || [];

    // thay tất cả img có data-file-index
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
      <Box sx={{backgroundColor:"#245D51"}}>
      <DialogTitle sx={{color:"white"}}>
        Chi tiết câu hỏi
        <Button onClick={onClose} sx={{ position: "absolute", right: 8, top: 8, minWidth: "auto", color:"white"}}><CloseIcon /></Button>
      </DialogTitle>
      </Box>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography variant="h6">{cauHoi.tenHienThi}</Typography>

          <Typography variant="subtitle2" color="text.secondary">Thông tin:</Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
          <Typography variant="body2">
  <strong>Loại:</strong>{" "}
  {loaiMap[cauHoi.loaiCauHoi as LoaiKey] || cauHoi.loaiCauHoi}
</Typography>
<Typography variant="body2">
  <strong>Độ khó:</strong> {doKhoMap[cauHoi.doKho as doKhoKey] || cauHoi.doKho}
</Typography>
<Typography variant="body2">
  <strong>Chương:</strong> {cauHoi.idChuong}
</Typography>


          </Stack>

          <Box>
            <Typography variant="subtitle1" sx={{ mt: 1, mb: 1 }}>Nội dung câu hỏi:</Typography>
            <Box
              sx={{
                border: "1px solid #e0e0e0", borderRadius: 1, padding: 2, backgroundColor: "#fafafa",
                "& p.ql-align-center": { textAlign: "center" }, "& p.ql-align-right": { textAlign: "right" },
                "& p.ql-align-left": { textAlign: "left" }, "& strong": { fontWeight: "bold" },
                "& em": { fontStyle: "italic" }, "& u": { textDecoration: "underline" },
                "& img": { maxWidth: "100%", height: "auto", borderRadius: 1 }, whiteSpace: "pre-wrap",
              }}
              dangerouslySetInnerHTML={{ __html: processedHtml }}
            />
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Các đáp án:</Typography>
            <Stack spacing={1}>
              {dapAn?.map(ans => {
                const ansHtml = ans.noiDungHTML || ans.noiDung || "";
                return (
                  <Box
                    key={ans.id}
                    sx={{
                      display: "flex", flexDirection: "column", padding: 1, borderRadius: 1,
                      border: "1px solid #ddd", backgroundColor: ans.dapAnDung ? "#e6f4ea" : "#fff",
                      "& strong": { fontWeight: "bold" }, "& em": { fontStyle: "italic" },
                      "& u": { textDecoration: "underline" }, "& p.ql-align-center": { textAlign: "center" },
                      "& p.ql-align-right": { textAlign: "right" }, "& p.ql-align-left": { textAlign: "left" },
                      "& img": { maxWidth: "100%", height: "auto", borderRadius: 1 },
                    }}
                    dangerouslySetInnerHTML={{ __html: ansHtml }}
                  />
                );
              })}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained" sx={{backgroundColor:"#245D51"}}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuestionDetailDialog;
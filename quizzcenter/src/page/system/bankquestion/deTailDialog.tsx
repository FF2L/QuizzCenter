import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Stack, Box } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import { CauHoiPayload } from "../../../common/model";

interface QuestionDetailDialogProps {
  open: boolean;
  onClose: () => void;
  questionDetail: CauHoiPayload | null; // object câu hỏi
}

const QuestionDetailDialog = ({ open, onClose, questionDetail }: QuestionDetailDialogProps) => {
  if (!questionDetail) return null;
 
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
          <Typography variant="h6">Tên hiển thị: {questionDetail.cauHoi.tenHienThi}</Typography>
          <Typography variant="body1">Nội dung: {questionDetail.cauHoi.noiDungCauHoi}</Typography>
          <Typography variant="body2">Loại câu hỏi: {questionDetail.cauHoi.loaiCauHoi}</Typography>
          <Typography variant="body2">Độ khó: {questionDetail.cauHoi.doKho}</Typography>

          <Box>
            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Các đáp án:</Typography>
            <Stack spacing={1}>
              {questionDetail.dapAn?.map((dapAn) => (
                <Box
                  key={dapAn.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    padding: 1,
                    border: "1px solid #ccc",
                    borderRadius: 1,
                    backgroundColor: dapAn.dapAnDung ? "#e6f4ea" : "#fff"
                  }}
                >
                  <Typography>{dapAn.noiDung}</Typography>
                  {dapAn.dapAnDung && <CheckCircleIcon sx={{ color: "green" }} />}
                </Box>
              ))}
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

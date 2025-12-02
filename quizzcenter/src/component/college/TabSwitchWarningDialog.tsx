import React, { useEffect, useState } from "react";
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  Typography,
  LinearProgress,
  Box
} from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";

interface Props {
  open: boolean;
  onClose: () => void;
  onAutoSubmit: () => void;
  countdownSeconds?: number;
}

const TabSwitchWarningDialog: React.FC<Props> = ({
  open,
  onClose,
  onAutoSubmit,
  countdownSeconds = 5,
}) => {
  const [countdown, setCountdown] = useState(countdownSeconds);

  useEffect(() => {
    if (!open) {
      setCountdown(countdownSeconds);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, countdownSeconds, onAutoSubmit]);

  const progress = ((countdownSeconds - countdown) / countdownSeconds) * 100;

  return (
    <Dialog 
      open={open}
      onClose={(event, reason) => {
        // Chặn tất cả các cách đóng dialog
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
          return;
        }
      }}
      disableEscapeKeyDown
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#fff3e0',
          border: '2px solid #ff9800',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        color: '#e65100',
        fontWeight: 700,
      }}>
        <ErrorIcon sx={{ fontSize: 32, color: '#f44336' }} />
        Cảnh báo nghiêm trọng!
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
          Bạn đã chuyển tab <strong>3 lần</strong> - vượt quá giới hạn cho phép!
        </Typography>
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
          ⚠️ Hệ thống sẽ tự động nộp bài sau <strong>{countdown} giây</strong>
        </Typography>
        <Box sx={{ mb: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress}
            color="error"
            sx={{ height: 8, borderRadius: 1 }}
          />
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          Không thể đóng thông báo này. Vui lòng chờ hệ thống nộp bài tự động.
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default TabSwitchWarningDialog;
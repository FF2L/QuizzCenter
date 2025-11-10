import React from "react";
import { useEffect, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";
import { Chuong } from "../../../../common/model";
import { LectureService } from "../../../../services/lecture.api";

interface CreateDialogProps {
  open: boolean;
  onClose: () => void;
  idMonHoc: number;
  nextThuTu?: number;
  idGiangVien?: number;
  onCreated?: (newChuong: Chuong) => void;
  accessToken: string;
}

export default function CreateDialog({ 
  open, 
  onClose, 
  idMonHoc,
  nextThuTu,
  idGiangVien,
  accessToken,
  onCreated, 
}: CreateDialogProps) {
  const [tenChuong, setTenChuong] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errTaoChuong, setErrTaoChuong] = useState("");

  useEffect(() => {
    setErrTaoChuong("");
    // Reset form khi mở dialog
    if (open) {
      setTenChuong("");
    }
  }, [open]);

  const handleCreate = async () => {
    setErrTaoChuong("");
    if (!tenChuong.trim()) {
      setErrTaoChuong("Tên chương không được để trống");
      return;
    }

    setSubmitting(true);
    try {
      const res = await LectureService.taoChuongTheoMonHoc(
        tenChuong.trim(),
        idMonHoc,
        accessToken
      );

      console.log("Response từ API tạo chương:", res);

      if (!res.ok) {
        setErrTaoChuong("Lỗi tạo chương");
        return;
      }

      // Tạo object chương mới giống như bên update
      const newChuong: Chuong = {
        tenchuong: tenChuong.trim(),
        // Merge với data từ API nếu có
        ...(res.data && typeof res.data === 'object' ? res.data : {})
      } as Chuong;
      
      console.log("Chương mới được tạo:", newChuong);

      // Gọi callback để cập nhật parent
      if (onCreated) {
        onCreated(newChuong);
      }

      // Reset form và đóng dialog
      setTenChuong("");
      onClose();
    } catch (err) {
      console.error("Lỗi tạo chương:", err);
      setErrTaoChuong("Có lỗi xảy ra khi tạo chương");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth  
      sx={{
        "& .MuiPaper-root": {
          borderRadius: "20px",
          padding: "16px",
          backgroundColor: "white",
        },
      }}
    >
      <Box sx={{display:'flex', flexDirection:'row'}}>
        <img 
          src="/assets/CreateIcon.gif" 
          alt="icon"  
          style={{height:"40px", width:"50px", marginRight: "-5px"}}   
        />
        <DialogTitle sx={{fontWeight:'bold', p: 0, m: 1}}>
          Tạo mới
        </DialogTitle>
      </Box>  
      
      <DialogContent>
        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography>Tên danh mục:</Typography>
          {errTaoChuong && (
            <Typography color="error" variant="body2">{errTaoChuong}</Typography>
          )}
          <TextField
            placeholder="Nhập tên..."
            size="small"
            value={tenChuong}
            onChange={(e) => setTenChuong(e.target.value)}
            disabled={submitting}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "20px",
                backgroundColor:'#E8E8E8',
                "& fieldset": {
                  border: "none",
                },
              },
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={onClose} 
          variant="outlined" 
          disabled={submitting} 
          sx={{borderRadius:'10px'}}
        >
          Hủy
        </Button>
        <Button  
          onClick={handleCreate}   
          disabled={submitting} 
          variant="contained" 
          sx={{ 
            borderRadius:'10px',
            backgroundColor: "#245d51", 
            "&:hover": { backgroundColor: "#1a4a3e" } 
          }}
        >
          {submitting ? "Đang tạo..." : "Tạo"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
import React from "react";
import { useEffect, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";
import { Chuong } from "../../../../common/model";
import { LectureService } from "../../../../services/lecture.api";

interface UpdateDialogProps {
  open: boolean;
  onClose: () => void;
  idMonHoc: number;
  nextThuTu?: number;
  idGiangVien?: number;
  accessToken?: string;
  onCreated?: (updatedChuong: Chuong) => void;
  currentChuong?: Chuong | null; 
}

export default function UpdateDialog({ 
  open, 
  onClose, 
  idMonHoc,
  currentChuong,
  nextThuTu,
  accessToken,
  idGiangVien,
  onCreated, 
}: UpdateDialogProps) {
  const [tenChuong, setTenChuong] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    setErr("");
    if (open && currentChuong) {
      setTenChuong(currentChuong.tenchuong);
    } else {
      setTenChuong("");
    }
  }, [open, currentChuong]);

  const handleUpdate = async () => {
    setErr("");
    if (!tenChuong.trim()) {
      setErr("Tên chương không được để trống");
      return;
    }

    if (!currentChuong) {
      setErr("Không tìm thấy thông tin chương");
      return;
    }

    setSubmitting(true);
    try {
      const res = await LectureService.capNhatChuong(
        currentChuong.id, 
        tenChuong, 
        accessToken ?? ""
      );

      console.log("Response từ API:", res);

      if (!res.ok) {
        setErr('Lỗi cập nhật chương');
        return;
      }

      // Tạo object chương đã cập nhật bằng cách merge dữ liệu cũ với tên mới
      const updatedChuong: Chuong = {
        ...currentChuong, // Giữ nguyên tất cả thông tin cũ
        tenchuong: tenChuong, // Chỉ cập nhật tên mới
        // Nếu API trả về data đầy đủ thì override
        ...(res.data && typeof res.data === 'object' ? res.data : {})
      };

      console.log("Chương sau khi cập nhật:", updatedChuong);

      // Gọi callback để cập nhật parent
      if (onCreated) {
        onCreated(updatedChuong);
      }

      // Reset form và đóng dialog
      setTenChuong("");
      onClose();
    } catch (err) {
      console.error("Lỗi cập nhật chương:", err);
      setErr("Có lỗi xảy ra khi cập nhật chương");
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
          Cập nhật
        </DialogTitle>
      </Box>  
      
      <DialogContent>
        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography>Tên danh mục:</Typography>
          {err && (
            <Typography color="error" variant="body2">{err}</Typography>
          )}
          <TextField
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
          onClick={handleUpdate}   
          disabled={submitting} 
          variant="contained" 
          sx={{ 
            borderRadius:'10px',
            backgroundColor: "#245d51", 
            "&:hover": { backgroundColor: "#1a4a3e" } 
          }}
        >
          {submitting ? "Đang cập nhật..." : "Cập nhật"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
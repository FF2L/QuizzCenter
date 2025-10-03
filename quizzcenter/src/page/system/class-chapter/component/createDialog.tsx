import React from "react";
import { useEffect, useState, use } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";
import  { Chuong } from "../../../../common/model";
interface CreateDialogProps {
  open: boolean;
  onClose: () => void;
  idMonHoc: number; // bắt buộc truyền vào từ parent
  nextThuTu?: number; // optional: nếu bạn muốn frontend tính vị trí tiếp theo
  idGiangVien?: number; // optional: lấy từ auth nếu có
  onCreated?: (newChuong: Chuong) => void;
}


export default function CreateDialog({ 
  open, 
  onClose, 
  idMonHoc,
  nextThuTu,
  idGiangVien,
  onCreated, }: CreateDialogProps) {
    const [tenChuong, setTenChuong] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const handleCreate = async () => {
      if (!tenChuong.trim()) return;
  
      setSubmitting(true);
      try {
        const body: any = {
          tenChuong: tenChuong.trim(),
          thuTu: 1,
          idMonHoc,
        };

        // idGiangVien nên lấy từ auth; nếu chưa có, fallback tạm  (nhớ sửa)
        if (typeof idGiangVien !== "undefined") body.idGiangVien = idGiangVien;
  
        const res = await fetch("http://localhost:3000/chuong", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
  
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || res.statusText);
        }
  
        const newChuong: Chuong = await res.json();
  
        // gọi về parent để cập nhật list (parent có thể refetch để đảm bảo thứ tự chính xác)
        onCreated?.(newChuong);
  
        // reset + đóng
        setTenChuong("");
        onClose();
      } catch (err) {
        console.error("Lỗi tạo chương:", err);
        // TODO: hiển thị toast/alert nếu cần
      } finally {
        setSubmitting(false);
      }
    };


  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth  
       sx={{
        "& .MuiPaper-root": {
          borderRadius: "20px", // bo góc
          padding: "16px",      // padding bên trong
          backgroundColor: "white", // màu nền
        },
      }}>
      <Box sx={{display:'flex', flexDirection:'row'}}>
        <img src="/assets/CreateIcon.gif" alt="icon"  style={{height:"40px", width:"50px",marginRight: "-5px"}}   />
         <DialogTitle sx={{fontWeight:'bold',p: 0, m: 1}}>Tạo mới</DialogTitle>
      </Box>  
      <DialogContent>
        <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography>Tên danh mục:</Typography>
          <TextField
            placeholder="Nhập tên..."
            size="small"
            value={tenChuong}
            onChange={(e) => setTenChuong(e.target.value)}
            sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "20px", // target chính xác container input
                  backgroundColor:'#E8E8E8',
                  "& fieldset": {
                    border: "none", // bỏ viền
                  },
                },
              }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="outlined" disabled={submitting} sx={{borderRadius:'10px'}}>
          Hủy
        </Button>
        <Button  onClick={handleCreate}   disabled={submitting} variant="contained" sx={{ borderRadius:'10px',backgroundColor: "#245d51", "&:hover": { backgroundColor: "#1a4a3e" } }}>
        {submitting ? "Đang tạo..." : "Tạo"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Stack, TextField, Button, Typography, Snackbar, Alert, CircularProgress } from "@mui/material";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { LoginService } from "../../services/login.api";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const otpToken = () => {
      const token  = location.state?.token
      return token
  }
  const resetPassEmail = () => {
      const email = location.state?.email
      return email
  }

  const navigate = useNavigate();
  const token = localStorage.getItem("resetToken");

  const handleResetPassword = async () => {
    setErr("");
    if (!newPassword){
      setErr("Vui lòng nhập mật khẩu mới");
      return
    }else{
      if(newPassword.length < 8){
        setErr("Mật khẩu phải có ít nhất 8 ký tự");
        return
      }
      
    } 
    const res = await LoginService.resetPassword(otpToken(), newPassword);
    setLoading(true);
    if(!res.ok){
      setErr("Đặt lại mật khẩu không thành công");
      console.log(newPassword)
      setLoading(false);
      return
    }
    navigate(('/login'),{state: {email: resetPassEmail()} });
      
    

  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) =>{
      if(e.key === "Enter") handleResetPassword()
    }
  window.addEventListener("keydown",handler)
  return(() => window.removeEventListener("keydown",handler))
  })

  return (
    <Box sx={{ width: '100%' }}>

          <Stack spacing={8} width="100%">
            <Box
              component="img"
              src="/assets/image-removebg-preview.png"
              alt="logo"
              sx={{ width: 200, height: 'auto', borderRadius: 2, alignSelf: 'center', justifySelf: 'center', py: 5 }}
            />
            <Typography variant="h6" fontWeight="bold" textAlign="center">Tạo mật khẩu mới</Typography>
            <TextField
              placeholder="Nhập mật khẩu mới..."
              type="password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{
                backgroundColor: '#EAF0F0',
                borderRadius: '8px',
                "& .MuiInputBase-input": { color: "#000" },
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#ccc" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#888" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#245D51" }
              }}
            />
            {err && <Typography color="error" fontSize={14}>{err}</Typography>}
            <Button variant="contained" color="primary" fullWidth onClick={handleResetPassword} disabled={loading}>
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : "Xác nhận"}
            </Button>
          </Stack>

    </Box>
  );
}

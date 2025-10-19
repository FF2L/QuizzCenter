import React, { useState,useRef, useEffect } from "react";
import { Box, Card, CardContent, Stack, TextField, Button, Typography, Snackbar, Alert, CircularProgress } from "@mui/material";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { LoginService } from "../../services/login.api";


export default function OTPVerifyPage() {
  const [otp, setOtp] = useState("");
  const [errOtp, setErrOtp] = useState("");
  const [resendOtp, setResendOtp] = useState(false);
  const [loading, setLoading] = useState(false);
   const location = useLocation();
  const navigate = useNavigate();
  const oTPEmail = () => {
      const email = location.state?.email
      return email
  }
  

  const handleVerifyOTP = async () => {
    setErrOtp('')
    if (!otp){
      setErrOtp ("Vui lòng nhập mã OTP")
      return
    }
      const res = await LoginService.verifyOTP(oTPEmail(), otp)
      setLoading(true);
      if(!res.ok){
        setErrOtp("Mã OTP không đúng hoặc đã hết hạn")
        setLoading(false);
        return
      }
      const { resetToken } = res.data;
     navigate(("/reset-password"), {state: {token: resetToken, email: oTPEmail()}})
  
  };

  const handleResend = async () => {
    setErrOtp('')
    setOtp('')
    setResendOtp(false)
      const res = await LoginService.forgotPass(oTPEmail())
      if (res.ok) {
        setResendOtp(true)
      } else {
        setResendOtp(false)
      }

  };

  useEffect(() =>{
    const handler =(e: KeyboardEvent) =>{
      if(e.key === "Enter") handleVerifyOTP()
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

    <Typography variant="h6" fontWeight="bold" textAlign="center">Nhập mã OTP</Typography>
    <Typography variant="body2"  textAlign="center" width={"99%"} alignSelf={"center"}>Vui lòng nhập mã OTP đã được gửi đến {oTPEmail().replace(/^(.{3})[^@]*/, '$1***')} của bạn</Typography>
    {resendOtp && <Typography color="success" fontSize={14}>{resendOtp ? "Đã gửi lại mã OTP" : "Gửi lại mã OTP thất bại"}</Typography>}
    <TextField
      placeholder="Nhập OTP..."
      fullWidth
      value={otp}
                onChange={(e) => setOtp(e.target.value)}
                sx={{
                  backgroundColor: '#EAF0F0',
                  borderRadius: '8px',
                  "& .MuiInputBase-input": { color: "#000" },
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#ccc" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#888" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#245D51" }
                }}
              />
              {errOtp && <Typography color="error" fontSize={14}>{errOtp}</Typography>}
              <Button variant="contained" color="primary" fullWidth onClick={handleVerifyOTP} disabled={loading}>
                {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : "Xác thực OTP"}
              </Button>
              
              <Button color="secondary" fullWidth onClick={handleResend}>Gửi lại OTP</Button>

            </Stack>
          </Box>
    );
}

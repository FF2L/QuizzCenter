import React, { FC, useEffect, useState } from "react";
import { Box, Card, CardContent, Stack, TextField, Button, Typography, Snackbar, Alert, CircularProgress, InputAdornment, IconButton, Link } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { LoginService } from "../../services/login.api";

const ForgotPassword: FC = () =>{
  const [email, setEmail] = useState("");
  const [errorEmail, setErrorEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async () => {
    setErrorEmail("");
    if (!email){
      setErrorEmail("Vui lòng nhập email");
      return
    } else{
      const regexEmail = /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gim;
      if (!regexEmail.test(email)) {
        setErrorEmail('Email không hợp lệ');
        return;
      }
      const res = await LoginService.forgotPass(email)
      setLoading(true);
      if(!res.ok){
        setErrorEmail('Email không tồn tại')
        setLoading(false);
        return
      }
      navigate(('/otp'), {state: {email: email}})

    }

      setLoading(false);

  };

  useEffect(() =>{
    const handler = (e: KeyboardEvent) =>{
      if(e.key === "Enter") handleSendOTP();
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler)
  },[])

  return (
    <Box sx={{ width: '100%' }}>
          <Stack spacing={8} width="100%">
            <Box
              component="img"
              src="/assets/image-removebg-preview.png"
              alt="logo"
              sx={{ width: 200, height: 'auto', borderRadius: 2, alignSelf: 'center', justifySelf: 'center', py: 5 }}
            />
            <Box pb={5}>
              <Typography variant="h6" fontWeight="bold" textAlign="center">
              Quên mật khẩu?
              </Typography>
              <Typography variant="body2" fontWeight="regular" textAlign="center">
                Điền email của bạn để nhận mã OTP
              </Typography>
            </Box>
            
            <Stack spacing={1}>
              <Typography>Email</Typography>
              {errorEmail && <Typography color="error" fontSize={14}>{errorEmail}</Typography>}
              <TextField
                placeholder="Nhập email..."
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  backgroundColor: '#EAF0F0',
                  borderRadius: '8px',
                  "& .MuiInputBase-input": { color: "#000" },
                  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#ccc" },
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#888" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#245D51" }
                }}
              />
            </Stack>
            
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSendOTP}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : "Gửi OTP"}
            </Button>
              <Link  component={RouterLink} to="/login" underline="hover" variant="body2" color="#245D51" my={3} alignSelf={"center"} pb={5}>
                Quay lại đăng nhập
              </Link>
          </Stack>

    </Box>
  );
}
export default ForgotPassword;

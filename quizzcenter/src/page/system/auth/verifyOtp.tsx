import React, { useState } from "react";
import { Box, Card, CardContent, Stack, TextField, Button, Typography, Snackbar, Alert, CircularProgress } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function OTPVerifyPage() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState("");
  const navigate = useNavigate();
  const email = localStorage.getItem("resetEmail");

  const handleVerifyOTP = async () => {
    if (!otp) return alert("Vui lòng nhập mã OTP");
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:3000/auth/verify-otp", { email, code: otp });
      const { resetToken } = res.data;
      localStorage.setItem("resetToken", resetToken);
      setSnackbar("Xác thực OTP thành công!");
      setTimeout(() => navigate("/reset-password"), 1000);
    } catch (err: any) {
      alert(err.response?.data?.message || "Xác thực thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    await axios.post("http://localhost:3000/auth/resend-otp", { email });
    setSnackbar("Đã gửi lại OTP mới!");
  };

  return (
    <Box sx={{ position: 'relative', width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <img
        src="/assets/Book1.jpg"
        alt="Background"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}
      />
      <Card sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100vw', zIndex: 2, position: 'absolute', backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '50%', maxWidth: 500, boxShadow: 'none', zIndex: 2, position: 'absolute' }}>
          <Stack spacing={5} width="100%">
            <Typography variant="h6" fontWeight="bold" textAlign="center">Nhập mã OTP</Typography>
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
            <Button variant="contained" color="primary" fullWidth onClick={handleVerifyOTP} disabled={loading}>
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : "Xác thực OTP"}
            </Button>
            <Button color="secondary" fullWidth onClick={handleResend}>Gửi lại OTP</Button>
          </Stack>
        </CardContent>
      </Card>
      <Snackbar open={!!snackbar} autoHideDuration={2000} onClose={() => setSnackbar("")} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success">{snackbar}</Alert>
      </Snackbar>
    </Box>
  );
}

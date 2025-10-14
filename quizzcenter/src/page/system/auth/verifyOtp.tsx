import React, { useState } from "react";
import { Box, Card, CardContent, Stack, TextField, Button, Snackbar, Alert, Typography } from "@mui/material";
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
    <Box sx={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Card sx={{ width: 400, p: 3 }}>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant="h6" textAlign="center">Nhập mã OTP</Typography>
            <TextField label="Mã OTP" fullWidth value={otp} onChange={e => setOtp(e.target.value)} />
            <Button variant="contained" onClick={handleVerifyOTP} disabled={loading}>
              {loading ? "Đang xác thực..." : "Xác thực OTP"}
            </Button>
            <Button onClick={handleResend} color="secondary">Gửi lại OTP</Button>
          </Stack>
        </CardContent>
      </Card>
      <Snackbar open={!!snackbar} autoHideDuration={2000} onClose={() => setSnackbar("")}>
        <Alert severity="success">{snackbar}</Alert>
      </Snackbar>
    </Box>
  );
}

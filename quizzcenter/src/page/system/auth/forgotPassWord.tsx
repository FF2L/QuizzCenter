import React, { useState } from "react";
import { Box, Card, CardContent, Stack, TextField, Button, Typography, Snackbar, Alert } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState("");
  const navigate = useNavigate();

  const handleSendOTP = async () => {
    if (!email) return alert("Vui lòng nhập email");
    setLoading(true);
    try {
      await axios.post("http://localhost:3000/auth/forgot-pass", { email });
      localStorage.setItem("resetEmail", email);
      setSnackbar("OTP đã được gửi tới email của bạn!");
      setTimeout(() => navigate("/otp"), 1000);
    } catch (err: any) {
      alert(err.response?.data?.message || "Gửi OTP thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Card sx={{ width: 400, p: 3 }}>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant="h6" textAlign="center">Quên mật khẩu</Typography>
            <TextField label="Email" fullWidth value={email} onChange={e => setEmail(e.target.value)} />
            <Button variant="contained" onClick={handleSendOTP} disabled={loading}>
              {loading ? "Đang gửi..." : "Gửi OTP"}
            </Button>
          </Stack>
        </CardContent>
      </Card>
      <Snackbar open={!!snackbar} autoHideDuration={2000} onClose={() => setSnackbar("")}>
        <Alert severity="success">{snackbar}</Alert>
      </Snackbar>
    </Box>
  );
}

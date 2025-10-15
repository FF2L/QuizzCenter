import React, { useState } from "react";
import { Box, Card, CardContent, Stack, TextField, Button, Typography, Snackbar, Alert, CircularProgress, InputAdornment, IconButton } from "@mui/material";
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
    <Box
      sx={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <img
        src="/assets/Book1.jpg"
        alt="Background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 1
        }}
      />
      <Card
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          width: '100vw',
          zIndex: 2,
          position: 'absolute',
          backgroundColor: 'rgba(255, 255, 255, 0.3)'
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '50%',
            maxWidth: 500,
            boxShadow: 'none',
            zIndex: 2,
            position: 'absolute'
          }}
        >
          <Stack spacing={5} width="100%">
            <Typography variant="h6" fontWeight="bold" textAlign="center">
              Quên mật khẩu
            </Typography>

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

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSendOTP}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : "Gửi OTP"}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Snackbar
        open={!!snackbar}
        autoHideDuration={2000}
        onClose={() => setSnackbar("")}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success">{snackbar}</Alert>
      </Snackbar>
    </Box>
  );
}

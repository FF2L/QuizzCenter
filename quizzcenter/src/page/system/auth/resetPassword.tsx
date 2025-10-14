import React, { useState } from "react";
import { Box, Card, CardContent, Stack, TextField, Button, Snackbar, Alert, Typography } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("resetToken");

  const handleResetPassword = async () => {
    if (!newPassword) return alert("Vui lòng nhập mật khẩu mới");
    setLoading(true);
    try {
      await axios.post("http://localhost:3000/auth/reset-password-token", {
        token,
        newPassword,
      });
      setSnackbar("Đổi mật khẩu thành công!");
      setTimeout(() => {
        localStorage.removeItem("resetEmail");
        localStorage.removeItem("resetToken");
        navigate("/login");
      }, 1000);
    } catch (err: any) {
      alert(err.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <Card sx={{ width: 400, p: 3 }}>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant="h6" textAlign="center">Tạo mật khẩu mới</Typography>
            <TextField
              label="Mật khẩu mới"
              fullWidth
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
            <Button variant="contained" onClick={handleResetPassword} disabled={loading}>
              {loading ? "Đang cập nhật..." : "Xác nhận"}
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

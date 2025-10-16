import React, { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import {
  Card,
  CardContent,
  Stack,
  Typography,
  TextField,
  Button,
  Link,
  IconButton,
  InputAdornment,
  Box,
  CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useUser } from './userContext';
import axios from 'axios';

const LoginPage: FC = () => {
  const navigate = useNavigate();
  const { setRole,setName } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const handleTogglePassword = () => {
    setShowPassword(prev => !prev);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Vui lòng nhập email và mật khẩu');
      return;
    }
  
    setLoading(true);
  
    try {
      // Gọi API đăng nhập
      const res = await axios.post('http://localhost:3000/auth/login', {
        email,
        matKhau: password,
      });
  
      const { accessToken, refeshToken, vaiTro } = res.data;
  
      // Lưu token và vai trò
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refeshToken);
      localStorage.setItem('role', vaiTro);
      setRole(vaiTro);
  
      // 🔥 Gọi API lấy thông tin người dùng
      const userRes = await axios.get('http://localhost:3000/nguoi-dung', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      const user = userRes.data;
      const hoTen = user.hoTen || 'Người dùng'; // fallback nếu không có tên
  
      // Lưu thông tin người dùng
      localStorage.setItem('name', hoTen);
      setName(hoTen);
  
      // Snackbar hiển thị
      setSnackbarMessage(`Đăng nhập thành công! Vai trò: ${vaiTro}`);
      setSnackbarOpen(true);
  
      // Chuyển trang theo vai trò
      setTimeout(() => {
        if (vaiTro === 'GiaoVien') navigate('/course');
        else if (vaiTro === 'SinhVien') navigate('/quizzcenter/my/course');
      }, 1000);
    } catch (err: any) {
      console.error('Login error:', err);
  
      if (err.response) {
        const msg = err.response.data?.message || 'Đăng nhập thất bại';
        alert(msg);
      } else if (err.request) {
        alert('Không kết nối được server');
      } else {
        alert('Lỗi: ' + err.message);
      }
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
      {/* Hình nền */}
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
          <Stack direction="column" spacing={8} width="100%">
            <Typography variant="h6" fontWeight="bold" textAlign="center">
              Đăng nhập
            </Typography>

            <Stack spacing={1}>
              <Typography>Email</Typography>
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

            <Stack spacing={1}>
              <Typography>Mật khẩu</Typography>
              <TextField
                placeholder="Nhập mật khẩu..."
                type={showPassword ? 'text' : 'password'}
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleTogglePassword} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
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

            <Stack direction="row" justifyContent="flex-end">
              <Link href="/forgot-password" underline="hover" variant="body2" color="#245D51">
                Quên mật khẩu?
              </Link>
            </Stack>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Đăng nhập'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
      <Snackbar
  open={snackbarOpen}
  autoHideDuration={1000}
  onClose={() => setSnackbarOpen(false)}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
>
  <Alert severity="success" sx={{ width: '100%' }}>
    {snackbarMessage}
  </Alert>
</Snackbar>
    </Box>
    
  );
  
};

export default LoginPage;

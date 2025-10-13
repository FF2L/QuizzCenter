import React, { FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, Stack, Typography, TextField, Button, Link, IconButton, InputAdornment , Box} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const LoginPage: FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    navigate('/course');
  };

  const handleTogglePassword = () => {
    setShowPassword(prev => !prev);
  };

  return (
    <Box sx={{ position: 'relative', width: '100vw', height: '100vh',display: 'flex',
    justifyContent: 'center',
    alignItems: 'center', }}>
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
          zIndex: 1,
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
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        
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
          position: 'absolute',
        }}
      >
        <Stack direction="column" spacing={10} width="100%">
          <Typography variant="h6" fontWeight="bold" textAlign="center">
            Đăng nhập
          </Typography>

          <Stack spacing={1}>
            <Typography>Email</Typography>
            <TextField placeholder="Nhập email..." fullWidth   sx={{
    backgroundColor: "#EAF0F0", // màu nền
    borderRadius: "8px",        // bo góc
    "& .MuiInputBase-input": {
      color: "#000",            // màu chữ
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#ccc",      // màu viền
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#888",      // màu viền khi hover
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#245D51",   // màu viền khi focus
    },
  }}/>
          </Stack>

          <Stack spacing={1}>
            <Typography>Mật khẩu</Typography>
            <TextField
              placeholder="Nhập mật khẩu..."
              type={showPassword ? 'text' : 'password'}
              fullWidth
              sx={{
                backgroundColor: "#EAF0F0", // màu nền
                borderRadius: "8px",        // bo góc
                "& .MuiInputBase-input": {
                  color: "#000",            // màu chữ
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#ccc",      // màu viền
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#888",      // màu viền khi hover
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#245D51",   // màu viền khi focus
                },
              }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePassword} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

          <Stack direction="row" justifyContent="flex-end">
            <Link
              href="/forgot-password"
              underline="hover"
              variant="body2"
              color="#245D51"
            >
              Quên mật khẩu?
            </Link>
          </Stack>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleLogin}
          >
            Đăng nhập
          </Button>
        </Stack>
      </CardContent>
    </Card>
    </Box>
  );
};

export default LoginPage;

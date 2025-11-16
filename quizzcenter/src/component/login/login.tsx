import { FC, memo, useEffect, useState } from 'react';
import {  useOutletContext } from 'react-router-dom';
import { Link as RouterLink } from "react-router-dom";
import {
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
import { LoginService } from '../../services/login.api';

type LoginCtx = {
  setSnackbarOpen: (v: boolean) => void;
  setSnackbarMessage: (v: string) => void;
  setNextPath: (v: string) => void;
  email: string;
};


const Login: FC = () => {
  const { setSnackbarOpen, setSnackbarMessage, setNextPath, email: contextEmail } = useOutletContext<LoginCtx>();
  const [email, setEmail] = useState(() => contextEmail ?? '');
  const [errorEmail, setErrorEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [errorLogin, setErrorLogin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);


  const handleTogglePassword = () => {
    setShowPassword(prev => !prev);
  };

  const handleLogin = async () => {
    setErrorEmail('');
    setErrorPassword('');
    setErrorLogin('');

    if (!email && !password) {
      setErrorEmail('Vui lòng nhập email')
      setErrorPassword('Vui lòng nhập mật khẩu')
      return;
    }
      if (!email) {
        setErrorEmail('Vui lòng nhập email')
      } else{
        const regexEmail = /^((?!\.)[\w-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/gim;
        if (!regexEmail.test(email)) {
          setErrorEmail('Email không hợp lệ');
          return;
        }
      }
      if(!password){
        setErrorPassword('Vui lòng nhập mật khẩu');
        return
      }

      setLoading(true);
      // Gọi API đăng nhập
      const res = await LoginService.login(email,password);
        
      if (!res.ok) {
        setErrorLogin('Mật khẩu hoặc email không đúng');
        setLoading(false);
        return
      }
   
  
      const { accessToken, refeshToken, vaiTro } = res.data;
      if (vaiTro === 'GiaoVien'){
        localStorage.setItem('accessTokenGV', accessToken);
        localStorage.setItem('refreshTokenGV', refeshToken);
         setLoading(false);
        setNextPath('/lecturer/home');
    
      }else if (vaiTro === 'SinhVien'){
        localStorage.setItem('accessTokenSV', accessToken);
        localStorage.setItem('refreshTokenSV', refeshToken);
        setLoading(false);
        setNextPath('/quizzcenter/my/course');
        
      }else if(vaiTro === 'Admin'){
        localStorage.setItem('accessTokenAD', accessToken);
        localStorage.setItem('refreshTokenAD', refeshToken);
        setLoading(false);
        setNextPath('/admin/qlnd');
      }
      setSnackbarMessage(`Đăng nhập thành công! Vai trò: ${vaiTro}`);
      setSnackbarOpen(true);
  

  };
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };
  window.addEventListener('keydown', handler);
  return () => window.removeEventListener('keydown', handler);
}, [handleLogin]);

  

  return (
    <Box sx={{ width: '100%' }}>

          <Stack direction="column" spacing={8} width="100%">
            <Box
              component="img"
              src="/assets/image-removebg-preview.png"
              alt="logo"
              sx={{ width: 200, height: 'auto', borderRadius: 2, alignSelf: 'center', justifySelf: 'center', py: 5 }}
            />
            <Typography variant="h6" fontWeight="bold" textAlign="center">
              Đăng nhập
            </Typography>

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

            <Stack spacing={1}>
              <Typography>Mật khẩu</Typography>
              {errorPassword && <Typography color="error" fontSize={14}>{errorPassword}</Typography>}
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
                        {!showPassword ? <VisibilityOff /> : <Visibility />}
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
              <Link  component={RouterLink} to="/forgot-password" underline="hover" variant="body2" color="#245D51" my={3}>
                Quên mật khẩu?
              </Link>
            </Stack>
            {errorLogin && <Typography color="error" alignSelf={"center"} fontSize={14}>{errorLogin}</Typography>}
            <Stack>
              
            </Stack>
            <Stack spacing={2} paddingBottom={10}>
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
            
          </Stack>
    </Box>

    
  );
  
};

export default memo(Login);

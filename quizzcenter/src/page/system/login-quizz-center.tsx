import { FC, useState } from 'react';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Snackbar,
} from '@mui/material';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

type LoginCtx = {
  setSnackbarOpen: (v: boolean) => void;
  setSnackbarMessage: (v: string) => void;
  setNextPath: (v: string) => void;
  email: string;
};

const LoginPage: FC = () => {
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [nextPath, setNextPath] = useState('')
    const [role, setRole] = useState('')
    const navigate = useNavigate();
    const location = useLocation()
    const email = location.state?.email || ''

  return (
    <Box
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

                  <Outlet
        context={{
          setSnackbarOpen,
          setSnackbarMessage,
          setNextPath, 
          email
        } satisfies LoginCtx}
      />
        </CardContent>
        </Card>

        <Snackbar
            open={ snackbarOpen}
            autoHideDuration={1000}
            onClose={() => {
                setSnackbarOpen(false);
                if(nextPath){
                    navigate((nextPath), {state: {role: role}});
                    setNextPath('');
                }
            }}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity="success" sx={{ width: '100%' }}>
            {snackbarMessage}
        </Alert>
              </Snackbar>
    </Box>
    
  );
  
};

export default LoginPage;

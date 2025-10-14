import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: { main: "#F8F9FA" },
    secondary: { main: "#007CD5" },
    background: { default: "#F8F9FA" },
    text: {
      primary: "#000000",
      secondary: "#007CD5",
    },
  },
  typography: {
    fontSize: 16,
    fontFamily: "Inter",
  },
spacing:2,
  components: {
    MuiCardContent: {
      styleOverrides: {
        root: {
          minHeight: "15px", 
          borderRadius: "12px",
          boxShadow: "0 1px 5px rgba(0,0,0,0.08)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          },
          backgroundColor: "#ffffff",
          display:'flex',
          justifyContent:"space-between",
          alignItems:'center',
          alignContent:"center"
        },
      },
    },
    
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10, // vuông góc
          textTransform: "none", // giữ nguyên chữ
          fontWeight: 600,
          fontSize: "16px",
          padding: "8px 20px",
          transition: "all 0.3s ease",
          boxShadow: "none",
          height:"50px",
          "&:hover": {
            boxShadow: "0 0 6px rgba(0,0,0,0.2)",
          },
        },
        containedPrimary: {
          backgroundColor: "#245D51", // nền tối
          color: "#fff",           // chữ sáng
          "&:hover": {
            backgroundColor: "#000",
          },
        },
        outlinedSecondary: {
          backgroundColor: "#fff",  // nền sáng
          color: "#222",            // chữ tối
          border: "1px solid #222", // viền tối
          "&:hover": {
            backgroundColor: "#f3f3f3",
          },
        },
      },
    },
    
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          height: "50px",
          "& fieldset": {
            borderRadius: "10px",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: "15px",
          fontWeight: 600,
          color: "black", // màu label mặc định
        },
        shrink: {
          color: "#245D51 !important", // màu label khi focus hoặc có dữ liệu
          transform: "translate(14px, -9px) scale(0.9)",
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          width: "300px",
          backgroundColor: "#fff",
          "& .MuiOutlinedInput-root": {
            backgroundColor: "#fff",
            borderRadius: "10px",
          },
        },
        inputRoot: {
          height: "50px",
        },
        paper: {
          borderRadius: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        },
      },
    },
  },
});

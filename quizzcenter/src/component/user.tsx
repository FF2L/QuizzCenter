import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert,
  Divider,
  Chip,
  Card,
  CardContent,
  Fade,
  Tooltip,
} from "@mui/material";
import {
  Edit,
  Save,
  Cancel,
  Lock,
  Visibility,
  VisibilityOff,
  CameraAlt,
  Person,
  Email,
  Phone,
  Cake,
  Badge,
} from "@mui/icons-material";
import { UserService, UserInfo, UpdateUserDto, ChangePasswordDto } from "../services/user.api";

export default function User() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    hoTen: "",
    soDienThoai: "",
    anhDaiDien: "",
    ngaySinh: "",
  });

  const [passwordData, setPasswordData] = useState({
    matKhauCu: "",
    matKhauMoi: "",
    xacNhanMatKhau: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const [errors, setErrors] = useState({
    hoTen: "",
    soDienThoai: "",
    ngaySinh: "",
  });

  const [passwordErrors, setPasswordErrors] = useState({
    matKhauCu: "",
    matKhauMoi: "",
    xacNhanMatKhau: "",
  });

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    setLoading(true);
    const res = await UserService.getUserInfo();
    if (res.ok && res.data) {
      setUserInfo(res.data);
      setFormData({
        hoTen: res.data.hoTen,
        soDienThoai: res.data.soDienThoai,
        anhDaiDien: res.data.anhDaiDien,
        ngaySinh: res.data.ngaySinh ? new Date(res.data.ngaySinh).toISOString().split("T")[0] : "",
      });
    } else {
      showSnackbar(res.message || "Không thể tải thông tin người dùng", "error");
    }
    setLoading(false);
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const validateForm = (): boolean => {
    const newErrors = {
      hoTen: "",
      soDienThoai: "",
      ngaySinh: "",
    };

    if (!formData.hoTen.trim()) {
      newErrors.hoTen = "Vui lòng nhập họ tên";
    }

    if (!formData.soDienThoai.trim()) {
      newErrors.soDienThoai = "Vui lòng nhập số điện thoại";
    } else if (!/^0\d{9}$/.test(formData.soDienThoai)) {
      newErrors.soDienThoai = "Số điện thoại không hợp lệ";
    }

    if (!formData.ngaySinh) {
      newErrors.ngaySinh = "Vui lòng chọn ngày sinh";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (userInfo) {
      setFormData({
        hoTen: userInfo.hoTen,
        soDienThoai: userInfo.soDienThoai,
        anhDaiDien: userInfo.anhDaiDien,
        ngaySinh: userInfo.ngaySinh ? new Date(userInfo.ngaySinh).toISOString().split("T")[0] : "",
      });
    }
    setIsEditing(false);
    setErrors({ hoTen: "", soDienThoai: "", ngaySinh: "" });
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const updateData: UpdateUserDto = {
      hoTen: formData.hoTen,
      soDienThoai: formData.soDienThoai,
      anhDaiDien: formData.anhDaiDien,
      ngaySinh: new Date(formData.ngaySinh).toISOString(),
    };

    const res = await UserService.updateUserInfo(updateData);
    if (res.ok && res.data) {
      setUserInfo(res.data);
      setIsEditing(false);
      showSnackbar("Cập nhật thông tin thành công", "success");
    } else {
      showSnackbar(res.message || "Không thể cập nhật thông tin", "error");
    }
    setLoading(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showSnackbar("Vui lòng chọn file ảnh", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showSnackbar("Kích thước ảnh không được vượt quá 5MB", "error");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, anhDaiDien: reader.result as string });
        showSnackbar("Tải ảnh thành công", "success");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      showSnackbar("Không thể tải ảnh lên", "error");
    } finally {
      setUploading(false);
    }
  };

  const validatePasswordForm = (): boolean => {
    const newErrors = {
      matKhauCu: "",
      matKhauMoi: "",
      xacNhanMatKhau: "",
    };

    if (!passwordData.matKhauCu) {
      newErrors.matKhauCu = "Vui lòng nhập mật khẩu cũ";
    }

    if (!passwordData.matKhauMoi) {
      newErrors.matKhauMoi = "Vui lòng nhập mật khẩu mới";
    } else if (passwordData.matKhauMoi.length < 8) {
      newErrors.matKhauMoi = "Mật khẩu phải có ít nhất 8 ký tự";
    }

    if (!passwordData.xacNhanMatKhau) {
      newErrors.xacNhanMatKhau = "Vui lòng xác nhận mật khẩu";
    } else if (passwordData.matKhauMoi !== passwordData.xacNhanMatKhau) {
      newErrors.xacNhanMatKhau = "Mật khẩu xác nhận không khớp";
    }

    setPasswordErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) return;

    setLoading(true);
    const changePasswordDto: ChangePasswordDto = {
      matKhauCu: passwordData.matKhauCu,
      matKhauMoi: passwordData.matKhauMoi,
    };

    const res = await UserService.changePassword(changePasswordDto);
    if (res.ok) {
      showSnackbar("Đổi mật khẩu thành công", "success");
      setOpenPasswordDialog(false);
      setPasswordData({ matKhauCu: "", matKhauMoi: "", xacNhanMatKhau: "" });
      setPasswordErrors({ matKhauCu: "", matKhauMoi: "", xacNhanMatKhau: "" });
    } else {
      showSnackbar(res.message || "Không thể đổi mật khẩu", "error");
    }
    setLoading(false);
  };

  if (loading && !userInfo) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="600px"
      >
        <CircularProgress size={60} sx={{ color: "white" }} />
      </Box>
    );
  }

  return (
    <Box
  sx={{
    minHeight: "100vh",
    py: 4,
    px: 2,
    position: "relative",
    overflow: "hidden",
    borderRadius: 2,
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundImage: 'url(/assets/Book1.jpg)',
      backgroundSize: "cover",
      backgroundPosition: "center",
      filter: "blur(2px)", // Làm mờ hình nền
      zIndex: 0,
    },
  }}
>
      <Fade in={true} timeout={800}>
        <Box sx={{ maxWidth: 1100, mx: "auto" }}>
          {/* Header Card */}
          <Card 
            elevation={0}
            sx={{ 
              mb: 3,
              borderRadius: 4,
              background: "linear-gradient(180deg,#245D51,#1B3D36)",
              backdropFilter: "blur(10px)",
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography 
                    variant="h4" 
                    fontWeight="700" 
                    sx={{
                      background: "linear-gradient(180deg,#245D51,#1B3D36)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      mb: 1,
                    }}
                  >
                    Hồ Sơ Cá Nhân
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Quản lý thông tin và cài đặt tài khoản của bạn
                  </Typography>
                </Box>
                {!isEditing && (
                  <Chip 
                    label="Hoạt động" 
                    color="success" 
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Main Profile Card */}
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              overflow: "hidden",
            }}
          >
            {/* Avatar Section with Gradient Background */}
            <Box
              sx={{
                background: "linear-gradient(135deg, #245D51 0%, #0F2E2B 100%)",
                pt: 6,
                pb: 10,
                position: "relative",
              }}
            >
              <Box display="flex" flexDirection="column" alignItems="center">
                <Box position="relative">
                  <Avatar
                    src={formData.anhDaiDien}
                    sx={{
                      width: 160,
                      height: 160,
                      border: "6px solid white",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                      transition: "transform 0.3s ease",
                      "&:hover": {
                        transform: isEditing ? "scale(1.05)" : "scale(1)",
                      },
                    }}
                  >
                    <Person sx={{ fontSize: 80 }} />
                  </Avatar>
                  {isEditing && (
                    <Tooltip title="Thay đổi ảnh đại diện">
                      <IconButton
                        component="label"
                        sx={{
                          position: "absolute",
                          bottom: 5,
                          right: 5,
                          bgcolor: "white",
                          color: "#667eea",
                          boxShadow: 2,
                          "&:hover": { 
                            bgcolor: "white",
                            transform: "scale(1.1)",
                          },
                          transition: "all 0.3s ease",
                        }}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <CircularProgress size={24} />
                        ) : (
                          <CameraAlt />
                        )}
                        <input 
                          type="file" 
                          hidden 
                          accept="image/*" 
                          onChange={handleImageUpload} 
                        />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>
            </Box>

            {/* Info Section */}
            <CardContent sx={{ mt: -6, px: 4, pb: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  bgcolor: "white",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                {/* User Name and ID */}
                <Box textAlign="center" mb={4}>
                  <Typography variant="h5" fontWeight="700" gutterBottom>
                    {userInfo?.hoTen}
                  </Typography>
                  <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                    <Badge sx={{ fontSize: 16, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary">
                      ID: {userInfo?.maNguoiDung}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ mb: 4 }} />

                {/* Form Fields */}
                <Grid container spacing={3}>
                  <Grid>
                    <Box 
                      sx={{ 
                        display: "flex", 
                        alignItems: "flex-start",
                        gap: 2,
                      }}
                    >
                      <Person sx={{ mt: 2, color: "#245D51" }} /> 
                      <TextField
                        label="Họ và tên"
                        fullWidth
                        value={formData.hoTen}
                        onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                        disabled={!isEditing}
                        error={!!errors.hoTen}
                        helperText={errors.hoTen}
                        variant="outlined"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            "&.Mui-focused fieldset": {
                              borderColor: "#667eea",
                            },
                          },
                        }}
                      />
                    </Box>
                  </Grid>

                  <Grid >
                    <Box 
                      sx={{ 
                        display: "flex", 
                        alignItems: "flex-start",
                        gap: 2,
                      }}
                    >
                      <Email sx={{ mt: 2, color: "#245D51" }} />
                      <TextField
                        label="Email"
                        fullWidth
                        value={userInfo?.email || ""}
                        disabled
                        variant="outlined"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            bgcolor: "rgba(0,0,0,0.02)",
                          },
                        }}
                      />
                    </Box>
                  </Grid>

                  <Grid >
                    <Box 
                      sx={{ 
                        display: "flex", 
                        alignItems: "flex-start",
                        gap: 2,
                      }}
                    >
                      <Phone sx={{ mt: 2, color: "#245D51" }} />
                      <TextField
                        label="Số điện thoại"
                        fullWidth
                        value={formData.soDienThoai}
                        onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                        disabled={!isEditing}
                        error={!!errors.soDienThoai}
                        helperText={errors.soDienThoai}
                        variant="outlined"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            "&.Mui-focused fieldset": {
                              borderColor: "#667eea",
                            },
                          },
                        }}
                      />
                    </Box>
                  </Grid>

                  <Grid >
                    <Box 
                      sx={{ 
                        display: "flex", 
                        alignItems: "flex-start",
                        gap: 2,
                      }}
                    >
                      <Cake sx={{ mt: 2, color: "#245D51" }} />
                      <TextField
                        label="Ngày sinh"
                        type="date"
                        fullWidth
                        value={formData.ngaySinh}
                        onChange={(e) => setFormData({ ...formData, ngaySinh: e.target.value })}
                        disabled={!isEditing}
                        error={!!errors.ngaySinh}
                        helperText={errors.ngaySinh}
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            "&.Mui-focused fieldset": {
                              borderColor: "#667eea",
                            },
                          },
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>

                {/* Action Buttons */}
                <Box 
                  sx={{ 
                    mt: 4, 
                    pt: 3,
                    borderTop: "1px solid",
                    borderColor: "divider",
                    display: "flex", 
                    gap: 2,
                    justifyContent: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {!isEditing ? (
                    <>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<Edit />}
                        onClick={handleEdit}
                        sx={{
                          background: "linear-gradient(135deg, #245D51 0%, #0F2E2B 100%)",
                          borderRadius: 2,
                          px: 4,
                          py: 1.5,
                          textTransform: "none",
                          fontWeight: 600,
                          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                          "&:hover": {
                            boxShadow: "0 6px 20px rgba(102, 126, 234, 0.6)",
                            transform: "translateY(-2px)",
                          },
                          transition: "all 0.3s ease",
                        }}
                      >
                        Chỉnh sửa thông tin
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        startIcon={<Lock />}
                        onClick={() => setOpenPasswordDialog(true)}
                        sx={{
                          borderColor: "#245D51",
                          color: "#245D51",
                          borderRadius: 2,
                          px: 4,
                          py: 1.5,
                          textTransform: "none",
                          fontWeight: 600,
                          borderWidth: 2,
                          "&:hover": {
                            borderColor: "#764ba2",
                            bgcolor: "rgba(102, 126, 234, 0.05)",
                            borderWidth: 2,
                            transform: "translateY(-2px)",
                          },
                          transition: "all 0.3s ease",
                        }}
                      >
                        Đổi mật khẩu
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={loading ? null : <Save />}
                        onClick={handleSave}
                        disabled={loading}
                        sx={{
                          background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                          borderRadius: 2,
                          px: 4,
                          py: 1.5,
                          textTransform: "none",
                          fontWeight: 600,
                          boxShadow: "0 4px 12px rgba(17, 153, 142, 0.4)",
                          "&:hover": {
                            boxShadow: "0 6px 20px rgba(17, 153, 142, 0.6)",
                            transform: "translateY(-2px)",
                          },
                          transition: "all 0.3s ease",
                        }}
                      >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Lưu thay đổi"}
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        startIcon={<Cancel />}
                        onClick={handleCancel}
                        sx={{
                          borderColor: "#ef5350",
                          color: "#ef5350",
                          borderRadius: 2,
                          px: 4,
                          py: 1.5,
                          textTransform: "none",
                          fontWeight: 600,
                          borderWidth: 2,
                          "&:hover": {
                            borderColor: "#d32f2f",
                            bgcolor: "rgba(239, 83, 80, 0.05)",
                            borderWidth: 2,
                            transform: "translateY(-2px)",
                          },
                          transition: "all 0.3s ease",
                        }}
                      >
                        Hủy bỏ
                      </Button>
                    </>
                  )}
                </Box>
              </Paper>
            </CardContent>
          </Card>
        </Box>
      </Fade>

      {/* Password Change Dialog */}
      <Dialog 
        open={openPasswordDialog} 
        onClose={() => setOpenPasswordDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle 
          sx={{ 
            background: "#245D51",
            color: "white",
            fontWeight: 700,
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <Lock />
            Đổi Mật Khẩu
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 5, mt:20 }}>
            <TextField
              label="Mật khẩu cũ"
              type={showOldPassword ? "text" : "password"}
              fullWidth
              value={passwordData.matKhauCu}
              onChange={(e) => setPasswordData({ ...passwordData, matKhauCu: e.target.value })}
              error={!!passwordErrors.matKhauCu}
              helperText={passwordErrors.matKhauCu}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused fieldset": {
                    borderColor: "#667eea",
                  },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowOldPassword(!showOldPassword)}>
                      {showOldPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Mật khẩu mới"
              type={showNewPassword ? "text" : "password"}
              fullWidth
              value={passwordData.matKhauMoi}
              onChange={(e) => setPasswordData({ ...passwordData, matKhauMoi: e.target.value })}
              error={!!passwordErrors.matKhauMoi}
              helperText={passwordErrors.matKhauMoi}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused fieldset": {
                    borderColor: "#667eea",
                  },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowNewPassword(!showNewPassword)}>
                      {showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Xác nhận mật khẩu mới"
              type={showConfirmPassword ? "text" : "password"}
              fullWidth
              value={passwordData.xacNhanMatKhau}
              onChange={(e) => setPasswordData({ ...passwordData, xacNhanMatKhau: e.target.value })}
              error={!!passwordErrors.xacNhanMatKhau}
              helperText={passwordErrors.xacNhanMatKhau}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&.Mui-focused fieldset": {
                    borderColor: "#667eea",
                  },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button 
            onClick={() => setOpenPasswordDialog(false)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              px: 3,
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            disabled={loading}
            sx={{
              background: "#245D51",
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
              "&:hover": {
                boxShadow: "0 6px 20px rgba(102, 126, 234, 0.6)",
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Đổi mật khẩu"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ 
            width: "100%",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
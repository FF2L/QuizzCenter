// ./page/system/login/protectedRoute.tsx
import React, { FC, ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { LoginService } from "../../../services/login.api";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  // Chưa xác thực thật, luôn cho qua
  // Sau này có thể: const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const isLogin = LoginService.getAccessToken() !== '';

  if (!isLogin) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;

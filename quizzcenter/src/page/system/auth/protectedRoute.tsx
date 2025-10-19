// ./page/system/login/protectedRoute.tsx
import React, { FC, ReactNode } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: FC<ProtectedRouteProps> = ({ children }) => {
  // Chưa xác thực thật, luôn cho qua
  // Sau này có thể: const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  return <>{children}</>;
};

export default ProtectedRoute;

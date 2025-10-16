import React, { FC } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import { theme } from './theme/theme';
import MainLayout from './overalllayout/mainlayout';
import Login from './page/system/auth/login';
import ProtectedRoute from './page/system/auth/protectedRoute';
import { UserProvider } from './page/system/auth/userContext';

import Course from './page/system/course/course';
import Page from './page/system/class-chapter/pageClass-Chapter';
import BaiKiemTraList from './page/system/test/test';
import BaiKiemTraDetail from './page/system/test/DetailTest';
import CreateQuestionPage from './page/system/bankquestion/createQuestion';
import CreateQuestionForTest from './page/system/test/nhapTayCauHoiChoBaiKiemtra';
import SelectFromBankPage from './page/system/test/chonCauHoiTuNganHangCauhoi';
import ForgotPasswordPage from './page/system/auth/forgotPassWord';
import OTPVerifyPage from './page/system/auth/verifyOtp';
import ResetPasswordPage from './page/system/auth/resetPassword';
import QuizzCenter from './page/system/college-quizz-center';
import CollegeDashBoard from './component/college/dashboard';
import CollegeMyCourse from './component/college/my-course';
import CollegeTest from './component/college/test';

const App: FC = () => {
  return (
    <UserProvider>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <Routes>
            {/* Login và forgot password không cần ProtectedRoute */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/otp" element={<OTPVerifyPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/*Các route cho phần sinh viên*/ }
            <Route path="quizzcenter" element={<ProtectedRoute><QuizzCenter /></ProtectedRoute>}>
            <Route index element={<Navigate to="my/course" replace />} />
            <Route path="my" element={<CollegeDashBoard />} />
            <Route path="my/course" element={<CollegeMyCourse />} />
            <Route path="course/test/:idLopHocPhan" element={<CollegeTest />} />
            </Route>


            {/* Các route cần đăng nhập */}
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="/course" element={<Course />} />

              <Route path="/page/:idMonHoc" element={<Page />} />
              <Route path="/lop-hoc-phan/bai-kiem-tra/:idLopHocPhan" element={<BaiKiemTraList />} />
              <Route path="/bai-kiem-tra/:idBaiKiemTra" element={<BaiKiemTraDetail />} />
              <Route path="/create-question" element={<CreateQuestionPage />} />
              <Route path="/bai-kiem-tra/:idBaiKiemTra/create-question-test" element={<CreateQuestionForTest />} />
              <Route path="/select-from-bank" element={<SelectFromBankPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </UserProvider>
  );
}
export default App;

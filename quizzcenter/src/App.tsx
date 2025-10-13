import React, { FC } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import { theme } from './theme/theme';
import MainLayout from './overalllayout/mainlayout';

import Login from './page/system/login/login';
import ProtectedRoute from './page/system/login/protectedRoute';

import Course from './page/system/course/course';
import Page from './page/system/class-chapter/pageClass-Chapter';
import BaiKiemTraList from './page/system/test/test';
import BaiKiemTraDetail from './page/system/test/DetailTest';
import CreateQuestionPage from './page/system/bankquestion/createQuestion';
import CreateQuestionForTest from './page/system/test/nhapTayCauHoiChoBaiKiemtra';
import SelectFromBankPage from './page/system/test/chonCauHoiTuNganHangCauhoi';

const App: FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <Routes>
          {/* Public route: login */}
          <Route path="/login" element={<Login />} />
          {/* Private routes: dùng MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/course" element={<ProtectedRoute><Course /></ProtectedRoute>} />
            <Route path="/page/:idMonHoc" element={<ProtectedRoute><Page /></ProtectedRoute>} />
            <Route path="/lop-hoc-phan/bai-kiem-tra/:idLopHocPhan" element={<ProtectedRoute><BaiKiemTraList /></ProtectedRoute>} />
            <Route path="/bai-kiem-tra/:idBaiKiemTra" element={<ProtectedRoute><BaiKiemTraDetail /></ProtectedRoute>} />
            <Route path="/create-question" element={<ProtectedRoute><CreateQuestionPage /></ProtectedRoute>} />
            <Route path="/bai-kiem-tra/:idBaiKiemTra/create-question-test" element={<ProtectedRoute><CreateQuestionForTest /></ProtectedRoute>} />
            <Route path="/select-from-bank" element={<ProtectedRoute><SelectFromBankPage /></ProtectedRoute>} />
          </Route>

          {/* Mặc định mở app vào login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

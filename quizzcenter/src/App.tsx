import { FC } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';
import { theme } from './theme/theme';

import ProtectedRoute from './page/system/auth/protectedRoute';
import { UserProvider } from './page/system/auth/userContext';

import Course from './component/lecture/course/course';
import Page from './page/system/class-chapter/pageClass-Chapter';
import BaiKiemTraList from './page/system/test/test';
import BaiKiemTraDetail from './page/system/test/DetailTest';

import CreateQuestionForTest from './page/system/test/nhapTayCauHoiChoBaiKiemtra';
import SelectFromBankPage from './page/system/test/chonCauHoiTuNganHangCauhoi';

import OTPVerifyPage from './component/login/verifyOtp';
import ResetPasswordPage from './component/login/resetPassword';
import QuizzCenter from './page/system/college-quizz-center';
import CollegeDashBoard from './component/college/dashboard';
import CollegeMyCourse from './component/college/my-course';
import CollegeTest from './component/college/test';
import CollegeTestDetail from "./component/college/testDetail";
import LamBaiPage from './component/college/doTest';
import XemLaiBaiLamPage from './component/college/viewDidTest';
import LoginPage from './page/system/login-quizz-center';
import Login from './component/login/login';
import ForgotPassword from './component/login/forgotPassWord';
import LecturerQuizzCenter from './page/system/lecturer-quizz-center';
import CollegeQuizzCenter from './page/system/college-quizz-center';
import User from './component/user';
import LectureHome from './component/lecture/home';
import LectureClass from './component/lecture/class';
import CreateQuestionPage from './page/system/bankquestion/createQuestion';
import UpdateQuestionPage from './page/system/bankquestion/updateQuestion';
import AdminQuizzCenter from './page/system/admin-quizz-center';
import QuanLyNguoiDung from './page/system/quan-ly-nguoi-dung/qlnd';
import PhanCongMonHoc from './page/system/phan-cong-mon-hoc/pcmh';
import QuanLyLopHoc from './page/system/quan-ly-lop-hoc/qllh';
import QuanLyMonHoc from './page/system/quan-ly-mon-hoc/plmh';
import ThemSinhVienVaoLopHocPhan from './page/system/quan-ly-lop-hoc/tsvlh';
import BangDiemPage from './page/system/test/result';

const App: FC = () => {
  return (
    <UserProvider>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <Routes>
            {/* Login và forgot password không cần ProtectedRoute */}
            <Route path="/" element={<LoginPage />}>
              <Route index element={<Navigate to="login" replace />} />
              <Route path="login" element={<Login />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="otp" element={<OTPVerifyPage />} />
              <Route path="reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* Các route cho phần sinh viên */}
            <Route path="quizzcenter" element={<ProtectedRoute><CollegeQuizzCenter /></ProtectedRoute>}>
              <Route index element={<Navigate to="my/course" replace />} />
              <Route path="my" element={<CollegeDashBoard />} />
              <Route path="my/course" element={<CollegeMyCourse />} />
              <Route path='my/userProfile' element={<User/>} />
              <Route path="course/test/:idLopHocPhan" element={<CollegeTest />} />
              <Route path="bai-kiem-tra-chi-tiet/:idBaiKiemTra" element={<CollegeTestDetail />} />
              <Route path="xem-lai/:idBaiLam" element={<XemLaiBaiLamPage />} />
              {/* CẬP NHẬT: Thêm idBaiLam vào route */}
              <Route path="lam-bai/:idBaiKiemTra" element={<LamBaiPage />} />
              <Route path="lam-bai/:idBaiKiemTra/:idBaiLam" element={<LamBaiPage />} />
            </Route>

            {/* Các route cho giáo viên */}
            <Route path="lecturer" element={<ProtectedRoute><LecturerQuizzCenter /></ProtectedRoute>}>
              <Route index element={<Navigate to="course" replace />} />
              <Route path="home" element={<LectureHome />} />
              <Route path="course" element={<Course />} />
              <Route path="user" element={<User />} />
              <Route path="class" element={<LectureClass />} />
              <Route path="course/:idMonHoc" element={<Page />} />
              <Route path="lop-hoc-phan/bai-kiem-tra/:idLopHocPhan" element={<BaiKiemTraList />} />
              <Route path="bai-kiem-tra/:idBaiKiemTra" element={<BaiKiemTraDetail />} />
              <Route path="lop-hoc-phan/:idLopHocPhan/bai-kiem-tra/:idBaiKiemTra/bang-diem" element={<BangDiemPage />} />
              <Route path="create-question" element={<CreateQuestionPage />} />
              <Route path="update-question/:cauHoiId" element={<UpdateQuestionPage />} />
              <Route path="bai-kiem-tra/:idBaiKiemTra/create-question-test" element={<CreateQuestionForTest />} />
              <Route path="select-from-bank" element={<SelectFromBankPage />} />
            </Route>

            {/* Các route cho quản trị viên */}
            <Route path="admin"element={<ProtectedRoute><AdminQuizzCenter /></ProtectedRoute>}>
              <Route index element={<Navigate to="qlnd" replace />} />
              <Route path="qlnd" element={<QuanLyNguoiDung />} />
              <Route path="pcmh" element={<PhanCongMonHoc />} />
              <Route path="pllh" element={<QuanLyLopHoc />} />
              <Route path="plmh" element={<QuanLyMonHoc />} />
              <Route path="tsvlh/:idLopHocPhan" element={<ThemSinhVienVaoLopHocPhan />} />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
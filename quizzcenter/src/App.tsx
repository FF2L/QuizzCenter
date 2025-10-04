import React from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from './overalllayout/mainlayout';

import Course from './page/system/course/course';
import Class from './page/system/class-chapter/pageClass-Chapter';
import Chapter from './page/system/chapter/chapter';
import TestDetail from './page/system/exam/Test';
import CategoryTab from './page/system/class-chapter/component/categoryTab';
import Page from "./page/system/class-chapter/pageClass-Chapter"
import CreateQuestionPage from './page/system/bankquestion/createQuestion';
import BaiKiemTraList from './page/system/test/test';
import BaiKiemTraDetail from "./page/system/test/DetailTest";

import CreateQuestionForTest from './page/system/test/nhapTayCauHoiChoBaiKiemtra';
import SelectFromBankPage from './page/system/test/chonCauHoiTuNganHangCauhoi';
function App() {
  return (
    <BrowserRouter>
    <MainLayout>
    <Routes>
    <Route path="/course" element={<Course/>} />
    <Route path="/page/:idMonHoc" element={<Page/>} />
    <Route path="/lop-hoc-phan/bai-kiem-tra/:idLopHocPhan" element={<BaiKiemTraList />} />
    <Route path="/bai-kiem-tra/:idBaiKiemTra" element={<BaiKiemTraDetail />} />
    <Route path="/create-question" element={<CreateQuestionPage />} />
     <Route path="/bai-kiem-tra/:idBaiKiemTra/create-question-test" element={<CreateQuestionForTest />} />
      <Route path="/select-from-bank" element={<SelectFromBankPage />} />
</Routes>
    </MainLayout>
  </BrowserRouter>
  );
}

export default App;

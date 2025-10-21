// Course.tsx (parent)
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HeaderSection } from './courseHead';
import { CourseList } from './courseList';
import { Pager } from './pagination';
import { LectureService } from '../../../services/lecture.api';

interface MonHoc { id: number; tenMonHoc: string; maMonHoc: string; }
interface ApiResponse { data: MonHoc[]; total: number; currentPage: number; totalPages: number; }

export default function Course() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [monHoc, setMonHoc] = useState<MonHoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [searchType, setSearchType] = useState<'maMon' | 'tenMon'>('maMon');
  const [searchValue, setSearchValue] = useState('');

  const accessToken = localStorage.getItem('accessTokenGV') || '';
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const limit = 10;

  const fetchMonHoc = useCallback(async (page = 1, sMa?: string, sTen?: string) => {
    if (!accessToken) { navigate('/login'); return; }
    setLoading(true);
    try {
      const res = await LectureService.getAllCourse(accessToken, page, limit, sMa, sTen);
      if (res.ok && res.data) {
        const api: ApiResponse = res.data;
        setMonHoc(api.data ?? []);
        setTotalPages(api.totalPages ?? 0);
      } else {
        setMonHoc([]); setTotalPages(0);
      }
    } finally {
      setLoading(false);
    }
  }, [accessToken, navigate]);

  useEffect(() => {
    if (accessToken) fetchMonHoc(currentPage);
  }, [accessToken, currentPage, fetchMonHoc]);

  // stable handlers (primitive-only params) → memoized children skip re-render khi props không đổi
  const handleTabChange = useCallback((nv: number) => setSelectedTab(nv), []);
  const handleSearchTypeChange = useCallback((v: 'maMon' | 'tenMon') => { setSearchType(v); setSearchValue(''); }, []);
  const handleSearchValueChange = useCallback((v: string) => {
    setSearchValue(v);
    if (v === '') { setSearchParams({ page: '1' }); fetchMonHoc(1); }
  }, [fetchMonHoc, setSearchParams]);

  const handleSearch = useCallback(() => {
    const v = searchValue.trim();
    setSearchParams({ page: '1' });
    if (!v) { fetchMonHoc(1); return; }
    if (searchType === 'maMon') fetchMonHoc(1, v, undefined);
    else fetchMonHoc(1, undefined, v);
  }, [fetchMonHoc, searchType, searchValue, setSearchParams]);

  const handlePageChange = useCallback((page: number) => {
    setSearchParams({ page: String(page) });
    // fetchMonHoc sẽ chạy lại qua useEffect (currentPage thay đổi)
  }, [setSearchParams]);

  const handleNavigate = useCallback((id: number, ten: string) => {
    navigate(`/lecturer/course/${id}`, { state: { tenMonHoc: ten } });
  }, [navigate]);

  if (!accessToken) {
    return <Box sx={{ p: 2, textAlign: 'center' }}><Typography>Đang chuyển hướng đến trang đăng nhập...</Typography></Box>;
  }
  if (loading) {
    return <Box sx={{ p: 2, textAlign: 'center' }}><Typography>Đang tải dữ liệu...</Typography></Box>;
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', backgroundColor: 'white', borderRadius: 2, p: 2 }}>
      <Stack spacing={3} sx={{ maxWidth: 1582, mx: 'auto' }}>
        <HeaderSection
            selectedTab={selectedTab}
            onTabChange={handleTabChange}
            searchType={searchType}
            searchValue={searchValue}
            onSearchTypeChange={handleSearchTypeChange}
            onSearchValueChange={handleSearchValueChange}
            onSearch={handleSearch}
            />

        <Box sx={{ borderRadius: 2, p: 4 }}>
          <Typography sx={{ fontSize: 20, mb: 3 }}>Các môn học</Typography>
          <CourseList
            monHoc={monHoc}
            emptyMsg={searchValue ? 'Không tìm thấy môn học nào' : 'Không có môn học nào'}
            onNavigate={handleNavigate}
          />
        </Box>
        <Pager totalPages={totalPages} currentPage={currentPage} onChange={handlePageChange} />
      </Stack>
    </Box>
  );
}

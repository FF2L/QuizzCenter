
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Stack,
  Typography,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Card,
  CardContent,
  Pagination,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LectureService } from '../../../services/lecture.api';

interface MonHoc {
  id: number;
  tenMonHoc: string;
  maMonHoc: string;
}

interface ApiResponse {
  data: MonHoc[];
  total: number;
  currentPage: number;
  totalPages: number;
}

export default function Course() {
  const [monHoc, setMonHoc] = useState<MonHoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [currentSearch, setCurrentSearch] = useState<{ sMa?: string; sTen?: string }>({});

  const accessToken = localStorage.getItem('accessTokenGV') || '';
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const limit = 10;

  const fetchMonHoc = async (page: number, sMa?: string, sTen?: string) => {
    if (!accessToken) {
      navigate('/login');
      return;
    }
    setLoading(true);
    try {
      console.log('Fetching with params:', { page, sMa, sTen });
      const res = await LectureService.getAllCourse(accessToken, page, limit, sMa, sTen);
      
      if (res.ok && res.data) {
        const api: ApiResponse = res.data;
        setMonHoc(api.data ?? []);
        setTotalPages(api.totalPages ?? 0);
      } else {
        setMonHoc([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setMonHoc([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (accessToken) {
      fetchMonHoc(1);
    }
  }, [accessToken]);

  const handlePageChange = (page: number) => {
    setSearchParams({ page: String(page) });
    fetchMonHoc(page, currentSearch.sMa, currentSearch.sTen);
  };

  const handleNavigate = (id: number, ten: string) => {
    navigate(`/lecturer/course/${id}`, { state: { tenMonHoc: ten } });
  };

  const handleSearchCallback = (searchType: 'maMon' | 'tenMon', searchValue: string) => {
    const v = searchValue.trim();
    setSearchParams({ page: '1' });
    
    if (!v) {
      setCurrentSearch({});
      fetchMonHoc(1);
      return;
    }
    
    if (searchType === 'maMon') {
      setCurrentSearch({ sMa: v });
      fetchMonHoc(1, v);
    } else {
      setCurrentSearch({ sTen: v });
      fetchMonHoc(1, undefined, v);
    }
  };


  if (!accessToken) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography>Đang chuyển hướng đến trang đăng nhập...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', backgroundColor: 'white', borderRadius: 2, p: 2 }}>
      <Stack spacing={3} sx={{ maxWidth: 1582, mx: 'auto' }}>
        
        {/* Header + search luôn giữ nguyên, không bị mất khi loading */}
        <SearchHeader onSearch={handleSearchCallback} />

        {/* Course List Section */}
        <Box sx={{ borderRadius: 2, p: 4 }}>
          <Typography sx={{ fontSize: 20, mb: 3 }}>Các môn học</Typography>

          {/* Nếu đang loading thì cho 1 dòng thông báo / skeleton ngay tại đây */}
          {loading && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography sx={{ color: 'gray' }}>Đang tải dữ liệu...</Typography>
            </Box>
          )}
          
          {!loading && monHoc.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography sx={{ fontSize: 16, color: 'gray' }}>
                Không có môn học nào
              </Typography>
            </Box>
          )}

          {!loading && monHoc.length > 0 && (
            <Stack spacing={3}>
              {monHoc.map((course) => (
                <Card key={course.id}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" spacing={3} alignItems="center">
                      <img
                        src="/assets/Book1.jpg"
                        style={{ height: 100, width: 200, borderRadius: 10 }}
                        alt={course.tenMonHoc || 'Môn học'}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h6"
                          onClick={() => handleNavigate(course.id, course.tenMonHoc)}
                          sx={{
                            cursor: 'pointer',
                            fontWeight: 500,
                            mb: 1,
                            '&:hover': { color: '#245d51' },
                          }}
                        >
                          {course.tenMonHoc || 'Chưa có tên'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'gray' }}>
                          Mã môn học: {course.maMonHoc || 'Chưa có mã'}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Box>

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(_, p) => handlePageChange(p)}
              color="primary"
              size="large"
              sx={{
                '& .MuiPaginationItem-root': {
                  fontSize: 16,
                  '&.Mui-selected': {
                    backgroundColor: '#245d51',
                    color: 'white',
                    '&:hover': { backgroundColor: '#1e4d42' },
                  },
                  '&:hover': { backgroundColor: '#f0f0f0' },
                },
              }}
            />
          </Box>
        )}
      </Stack>
    </Box>
  );
}



function SearchHeader({ onSearch }: { onSearch: (type: 'maMon' | 'tenMon', value: string) => void }) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchType, setSearchType] = useState<'maMon' | 'tenMon'>('maMon');
  const [searchValue, setSearchValue] = useState('');
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const handleSearchValueChange = (v: string) => {
    setSearchValue(v);
    

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      onSearch(searchType, v);
    }, 500);
  };

  const handleSearchTypeChange = (v: 'maMon' | 'tenMon') => {
    setSearchType(v);
    setSearchValue('');
    onSearch(v, ''); 
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      onSearch(searchType, searchValue);
    }
  };

  return (
    <Stack spacing={4}>
      {/* Tabs */}
      <Tabs
        value={selectedTab}
        onChange={(_, v) => setSelectedTab(v)}
        sx={{ '& .MuiTabs-indicator': { display: 'none' } }}
      >
        <Tab
          label={
            <Typography
              sx={{
                color: selectedTab === 0 ? 'white' : 'black',
                fontWeight: 500,
                fontSize: 20,
                textTransform: 'none',
              }}
            >
              Các môn học
            </Typography>
          }
          sx={{
            backgroundColor: selectedTab === 0 ? '#245d51' : '#e7e7e7',
            minHeight: 56,
            minWidth: 200,
            mr: 2,
            '&:hover': {
              backgroundColor: selectedTab === 0 ? '#245d51' : '#d0d0d0',
            },
          }}
        />
      </Tabs>

      {/* Search Row */}
      <Stack direction="row" spacing={2} alignItems="center">
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Tìm theo</InputLabel>
          <Select
            value={searchType}
            label="Tìm theo"
            onChange={(e) => handleSearchTypeChange(e.target.value as 'maMon' | 'tenMon')}
            sx={{
              height: 45,
              backgroundColor: '#f5f5f5',
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            }}
          >
            <MenuItem value="maMon">Mã môn</MenuItem>
            <MenuItem value="tenMon">Tên môn</MenuItem>
          </Select>
        </FormControl>

        <TextField
          placeholder={`Nhập ${searchType === 'maMon' ? 'mã môn học' : 'tên môn học'}...`}
          value={searchValue}
          onChange={(e) => handleSearchValueChange(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{
            width: '35%',
            '& .MuiOutlinedInput-root': {
              backgroundColor: '#e7e7e7',
              height: 45,
              border: 'none',
              '& fieldset': { border: 'none' },
              '& input': {
                fontWeight: 'bold',
                fontSize: 16,
                color: '#333',
              },
            },
          }}
        />
      </Stack>
    </Stack>
  );
}
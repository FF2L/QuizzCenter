import React from 'react';
import { Card, CardContent, Stack, Box, Typography } from '@mui/material';

interface MonHoc { id: number; tenMonHoc: string; maMonHoc: string; }
export const CourseItem = React.memo(function CourseItem({
  course, onNavigate,
}: { course: MonHoc; onNavigate: (id: number, ten: string) => void }) {
  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" spacing={3} alignItems="center">
          <img src="/assets/Book1.jpg" style={{ height: 100, width: 200, borderRadius: 10 }} alt={course.tenMonHoc}/>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              onClick={() => onNavigate(course.id, course.tenMonHoc)}
              sx={{ cursor: 'pointer', fontWeight: 500, mb: 1, '&:hover': { color: '#245d51' } }}
            >
              {course.tenMonHoc}
            </Typography>
            <Typography variant="body2" sx={{ color: 'gray' }}>
              Mã môn học: {course.maMonHoc}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
});

export const CourseList = React.memo(function CourseList({
  monHoc, emptyMsg, onNavigate,
}: {
  monHoc: MonHoc[];
  emptyMsg: string;
  onNavigate: (id: number, ten: string) => void;
}) {
  if (monHoc.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography sx={{ fontSize: 16, color: 'gray' }}>{emptyMsg}</Typography>
      </Box>
    );
  }
  return (
    <Stack spacing={3}>
      {monHoc.map((course) => (
        <CourseItem key={course.id} course={course} onNavigate={onNavigate} />
      ))}
    </Stack>
  );
});

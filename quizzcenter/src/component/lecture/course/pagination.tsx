// Pager.tsx
import React from 'react';
import { Box, Pagination } from '@mui/material';

export const Pager = React.memo(function Pager({
  totalPages, currentPage, onChange,
}: {
  totalPages: number;
  currentPage: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={(_, p) => onChange(p)}
        color="primary"
        size="large"
        sx={{
          '& .MuiPaginationItem-root': {
            fontSize: 16,
            '&.Mui-selected': { backgroundColor: '#245d51', color: 'white',
              '&:hover': { backgroundColor: '#1e4d42' } },
            '&:hover': { backgroundColor: '#f0f0f0' },
          },
        }}
      />
    </Box>
  );
});

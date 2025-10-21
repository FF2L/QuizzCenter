// HeaderSection.tsx
import React from 'react';
import { Tabs, Tab, Typography, Stack, FormControl, InputLabel, Select, MenuItem, TextField, Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export const HeaderSection = React.memo(function HeaderSection({
  selectedTab,
  onTabChange,
  searchType,
  searchValue,
  onSearchTypeChange,
  onSearchValueChange,
  onSearch,
}: {
  selectedTab: number;
  onTabChange: (v: number) => void;
  searchType: 'maMon' | 'tenMon';
  searchValue: string;
  onSearchTypeChange: (v: 'maMon' | 'tenMon') => void;
  onSearchValueChange: (v: string) => void;
  onSearch: () => void;
}) {
  return (
    <Stack spacing={4}>
      {/* Tabs */}
      <Tabs
        value={selectedTab}
        onChange={(_, v) => onTabChange(v)}
        sx={{ "& .MuiTabs-indicator": { display: "none" } }}
      >
        <Tab
          label={
            <Typography
              sx={{
                color: selectedTab === 0 ? "white" : "black",
                fontWeight: 500,
                fontSize: 20,
                textTransform: "none",
              }}
            >
              Các môn học
            </Typography>
          }
          sx={{
            backgroundColor: selectedTab === 0 ? "#245d51" : "#e7e7e7",
            minHeight: 56,
            minWidth: 200,
            mr: 2,
            "&:hover": {
              backgroundColor: selectedTab === 0 ? "#245d51" : "#d0d0d0",
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
            onChange={(e) => onSearchTypeChange(e.target.value as any)}
            sx={{
              height: 45,
              backgroundColor: "#f5f5f5",
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
            }}
          >
            <MenuItem value="maMon">Mã môn</MenuItem>
            <MenuItem value="tenMon">Tên môn</MenuItem>
          </Select>
        </FormControl>

        <TextField
          placeholder={`Nhập ${
            searchType === "maMon" ? "mã môn học" : "tên môn học"
          }...`}
          value={searchValue}
          onChange={(e) => onSearchValueChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          sx={{
            width: 350,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#e7e7e7",
              height: 45,
              border: "none",
              "& fieldset": { border: "none" },
              "& input": {
                fontWeight: "bold",
                fontSize: 16,
                color: "#333",
              },
            },
          }}
        />

        <Button
          variant="contained"
          startIcon={<SearchIcon />}
          onClick={onSearch}
          sx={{
            backgroundColor: "#245d51",
            height: 45,
            width: { xs: 130, sm: 150 },
            textTransform: "none",
            "&:hover": { backgroundColor: "#1e4d42" },
          }}
        >
          Tìm kiếm
        </Button>
      </Stack>
    </Stack>
  );
});

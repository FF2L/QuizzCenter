import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Skeleton,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { BaiKiemTraApi } from "../../api/bai-kiem-tra.api";
import { useNavigate } from "react-router-dom";
interface BaiKiemTra {
  id: number;
  tenBaiKiemTra: string;
  loaiKiemTra: string; // "BaiKiemTra" | "LuyenTap"
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  thoiGianLam: number; // seconds
  soLanLam:number;
  xemBaiLam?: boolean;
  hienThiKetQua?: boolean;
}

interface GroupedData {
  baiKiemTra: BaiKiemTra[];
  luyenTap: BaiKiemTra[];
}

const CollegeTest: React.FC = () => {
  const { idLopHocPhan } = useParams<{ idLopHocPhan: string }>();
  const location = useLocation();
  const { tenMonHoc, maMonHoc } = location.state || { tenMonHoc: "", maMonHoc: "" };
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [baiKiemTraList, setBaiKiemTraList] = useState<BaiKiemTra[]>([]);
  const [groupedData, setGroupedData] = useState<GroupedData>({
    baiKiemTra: [],
    luyenTap: [],
  });
  
  // State để kiểm soát accordion
  const [expandedBaiKiemTra, setExpandedBaiKiemTra] = useState(true);
  const [expandedLuyenTap, setExpandedLuyenTap] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!idLopHocPhan) return;
      
      try {
        setLoading(true);
        const data = await BaiKiemTraApi.layTatCaBaiKiemTraCuaLopHocPhan(idLopHocPhan);
        setBaiKiemTraList(data);

        // Nhóm dữ liệu theo loại
        const grouped: GroupedData = {
          baiKiemTra: [],
          luyenTap: [],
        };

        data.forEach((item: BaiKiemTra) => {
          if (item.loaiKiemTra === "BaiKiemTra") {
            grouped.baiKiemTra.push(item);
          } else if (item.loaiKiemTra === "LuyenTap") {
            grouped.luyenTap.push(item);
          }
        });

        setGroupedData(grouped);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idLopHocPhan]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Kiểm tra xem tất cả có đang mở hay không
  const isAllExpanded = expandedBaiKiemTra && expandedLuyenTap;

  // Toggle tất cả accordion
  const handleToggleAll = () => {
    const newState = !isAllExpanded;
    setExpandedBaiKiemTra(newState);
    setExpandedLuyenTap(newState);
  };

  const BaiKiemTraItem = ({ item }: { item: BaiKiemTra }) => (
    <Paper
    onClick={() => navigate(`/quizzcenter/bai-kiem-tra-chi-tiet/${item.id}`, { state: item })}
      sx={{
        p: 2,
        mb: 1.5,
        cursor: "pointer",
        transition: "all 0.2s",
        "&:hover": {
          boxShadow: 3,
          backgroundColor: "#f8f9fa",
        },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1,
            backgroundColor: "#e91e63",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <AssignmentIcon sx={{ color: "#fff", fontSize: 24 }} />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="subtitle1"
            sx={{
              color: "#e91e63",
              fontWeight: 600,
              mb: 0.5,
            }}
          >
            {item.loaiKiemTra === "BaiKiemTra" ? "TRẮC NGHIỆM" : "LUYỆN TẬP"}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
            {item.tenBaiKiemTra}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );

  const LoadingSkeleton = () => (
    <Box>
      {[1, 2, 3].map((i) => (
        <Paper key={i} sx={{ p: 2, mb: 1.5 }}>
          <Stack direction="row" spacing={2}>
            <Skeleton variant="rounded" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton width="30%" height={24} />
              <Skeleton width="70%" height={20} sx={{ mt: 1 }} />
            </Box>
          </Stack>
        </Paper>
      ))}
    </Box>
  );

  return (
    <Box sx={{ flex: 1, pt: "40px", px: { xs: 2, md: 8 }, pb: 4 }}>
      {/* Header với tên môn */}
      <Typography
        variant="h5"
        sx={{
          color: "#ff6a00",
          fontWeight: 700,
          mb: 3,
        }}
      >
        {tenMonHoc} ({maMonHoc})
      </Typography>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 500,
              color: "#666",
            },
            "& .Mui-selected": {
              color: "#4caf50 !important",
              fontWeight: 600,
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#4caf50",
              height: 3,
            },
          }}
        >
          <Tab label="Khóa học" />
          <Tab label="Điểm số" />
        </Tabs>
      </Box>

      {/* Nội dung tab */}
      {tabValue === 0 && (
        <Box>
          {/* Nút Mở rộng/Thu gọn tất cả */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
            <Button
              onClick={handleToggleAll}
              sx={{
                textTransform: "none",
                color: "#ff6a00",
                fontWeight: 500,
                "&:hover": {
                  backgroundColor: "transparent",
                  textDecoration: "underline",
                },
              }}
            >
              {isAllExpanded ? "Thu gọn tất cả" : "Mở rộng tất cả"}
            </Button>
          </Box>

          {loading ? (
            <LoadingSkeleton />
          ) : (
            <>
              {/* Section Bài Kiểm Tra */}
              <Accordion 
                expanded={expandedBaiKiemTra}
                onChange={() => setExpandedBaiKiemTra(!expandedBaiKiemTra)}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    backgroundColor: "#f5f5f5",
                    "& .MuiAccordionSummary-content": {
                      alignItems: "center",
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ color: "#ff6a00", fontWeight: 600 }}
                  >
                    Bài kiểm tra
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {groupedData.baiKiemTra.length > 0 ? (
                    groupedData.baiKiemTra.map((item) => (
                      <BaiKiemTraItem key={item.id} item={item} />
                    ))
                  ) : (
                    <Typography color="text.secondary">
                      Chưa có bài kiểm tra nào
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>

              {/* Section Luyện Tập */}
              <Accordion 
                sx={{ mt: 2 }}
                expanded={expandedLuyenTap}
                onChange={() => setExpandedLuyenTap(!expandedLuyenTap)}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    backgroundColor: "#f5f5f5",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ color: "#ff6a00", fontWeight: 600 }}
                  >
                    Luyện tập
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {groupedData.luyenTap.length > 0 ? (
                    groupedData.luyenTap.map((item) => (
                      <BaiKiemTraItem key={item.id} item={item} />
                    ))
                  ) : (
                    <Typography color="text.secondary">
                      Chưa có bài luyện tập nào
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            </>
          )}
        </Box>
      )}

      {tabValue === 1 && (
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            Chức năng Điểm số đang được phát triển
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default CollegeTest;
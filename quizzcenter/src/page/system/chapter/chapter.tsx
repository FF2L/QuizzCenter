import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Divider } from "@mui/material";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  IconButton,
  Button,
  Collapse,
} from "@mui/material";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateChapterDialog from "./dialog/createChapterDialog"; // popup tạo chương
import CreateTestDialog from "./dialog/createTestDialog"; // popup tạo bài kiểm tra

// Chương
interface Chapter {
  id: number;
  title: string;
  tests: string[];
  practices: string[];
}

export default function ChapterPage() {
  const navigate = useNavigate();

  // Danh sách chương
  const [chapters, setChapters] = useState<Chapter[]>([]);

  // Dialog state
  const [openChapterDialog, setOpenChapterDialog] = useState(false);
  const [openTestDialog, setOpenTestDialog] = useState<{ open: boolean; chapterId: number | null }>({ open: false, chapterId: null });
  const [openPracticeDialog, setOpenPracticeDialog] = useState<{ open: boolean; chapterId: number | null }>({ open: false, chapterId: null });

  // Expand state
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
  const [expandedTest, setExpandedTest] = useState<number | null>(null);
  const [expandedPractice, setExpandedPractice] = useState<number | null>(null);

  // Tạo chương mới
  const handleCreateChapter = (name: string) => {
    setChapters([...chapters, { id: Date.now(), title: name, tests: [], practices: [] }]);
  };

  // Tạo bài kiểm tra mới
  const handleCreateTest = (chapterId: number, testName: string) => {
    setChapters(chapters.map(ch =>
      ch.id === chapterId ? { ...ch, tests: [...ch.tests, testName] } : ch
    ));
  };

  // Tạo bài luyện tập mới
  const handleCreatePractice = (chapterId: number, practiceName: string) => {
    setChapters(chapters.map(ch =>
      ch.id === chapterId ? { ...ch, practices: [...ch.practices, practiceName] } : ch
    ));
  };

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", backgroundColor: "#f8f8f8", borderRadius: "10px", p: 2 }}>
      <Stack spacing={3} sx={{ maxWidth: 1582, mx: "auto" }}>
        {/* Nút back */}
        <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ pt: 4 }}>
          <IconButton
            onClick={() => navigate(-1)}
            sx={{
              backgroundColor: "#245d51",
              color: "white",
              borderRadius: "12px",
              width: 60,
              height: 60,
              "&:hover": { backgroundColor: "#1e4d42" },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Stack>

        {/* Tiêu đề + nút tạo chương */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography sx={{ fontSize: 20 }}>Chương</Typography>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#245d51",
              borderRadius: "12px",
              height: 50,
              minWidth: 140,
              fontFamily: "Poppins, Helvetica",
              fontWeight: "medium",
              fontSize: 18,
              textTransform: "none",
              "&:hover": { backgroundColor: "#1e4d42" },
            }}
            onClick={() => setOpenChapterDialog(true)}
          >
            Tạo chương
          </Button>
        </Stack>

        {/* Danh sách chương */}
        <Stack spacing={3}>
          {chapters.map((chapter) => {
            const isExpanded = expandedChapter === chapter.id;
            const isTestExpanded = expandedTest === chapter.id;
            const isPracticeExpanded = expandedPractice === chapter.id;

            return (
              <Card
                key={chapter.id}
                sx={{
                  borderRadius: "20px",
                  border: "1px",
                  cursor: "pointer",
                  "&:hover": { transform: "translateY(-2px)", transition: "transform 0.2s ease-in-out" },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Chương */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    onClick={() => setExpandedChapter(isExpanded ? null : chapter.id)}
                  >
                    <ExpandMoreIcon
                      sx={{
                        transition: "transform 0.2s",
                        transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                      }}
                    />
                    <Typography sx={{ fontFamily: "Poppins, Helvetica", fontSize: 20, fontWeight:'bold', color:'#245D51'  }}>
                      {chapter.title}
                    </Typography>
                  </Stack>

                  <Collapse in={isExpanded}>
                    <Divider sx={{ my: 1, borderColor: "#e0e0e0" }} />

                    {/* Luyện Tập */}
                    <Stack sx={{ pl: 3 }}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ cursor: "pointer" }}
                        onClick={() => setExpandedPractice(isPracticeExpanded ? null : chapter.id)}
                      >
                        <Stack direction="row" alignItems="center">
                          <ExpandMoreIcon
                            sx={{
                              transition: "transform 0.2s",
                              fontSize: 20,
                              transform: isPracticeExpanded ? "rotate(90deg)" : "rotate(0deg)",
                              mr: 1,
                            }}
                          />
                          <Typography sx={{ fontSize: 18, fontWeight:'bold' }}>Luyện tập</Typography>
                        </Stack>
                        <Button
                          variant="outlined"
                          sx={{ fontSize: 14 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenPracticeDialog({ open: true, chapterId: chapter.id });
                          }}
                        >
                          Tạo bài Luyện tập
                        </Button>
                      </Stack>

                      <Collapse in={isPracticeExpanded}>
                        <Stack sx={{ mt: 1, pl: 3 }}>
                          {chapter.practices.map((practice, idx) => (
                            <Typography
                              key={idx}
                              sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" }, color:'green' }}
                              onClick={() =>
                                navigate(`/practice/${chapter.id}/${encodeURIComponent(practice)}`)
                              }
                            >
                              {practice}
                            </Typography>
                          ))}
                        </Stack>
                      </Collapse>
                    </Stack>

                    {/* Kiểm tra */}
                    <Stack sx={{ pl: 3, mt: 2 }}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ cursor: "pointer" }}
                        onClick={() => setExpandedTest(isTestExpanded ? null : chapter.id)}
                      >
                        <Stack direction="row" alignItems="center">
                          <ExpandMoreIcon
                            sx={{
                              transition: "transform 0.2s",
                              fontSize: 20,
                              transform: isTestExpanded ? "rotate(90deg)" : "rotate(0deg)",
                              mr: 1,
                            }}
                          />
                          <Typography sx={{ fontSize: 18, fontWeight:'bold' }}>Kiểm tra</Typography>
                        </Stack>
                        <Button
                          variant="outlined"
                          sx={{ fontSize: 14 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenTestDialog({ open: true, chapterId: chapter.id });
                          }}
                        >
                          Tạo bài kiểm tra
                        </Button>
                      </Stack>

                      <Collapse in={isTestExpanded}>
                        <Stack sx={{ mt: 1, pl: 3 }}>
                          {chapter.tests.map((test, idx) => (
                            <Typography
                              key={idx}
                              sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" },color:'green' }}
                              onClick={() =>
                                navigate(`/test/${chapter.id}/${encodeURIComponent(test)}`)
                              }
                            >
                              {test}
                            </Typography>
                          ))}
                        </Stack>
                      </Collapse>
                    </Stack>
                  </Collapse>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      </Stack>

      {/* Popup tạo chương */}
      <CreateChapterDialog
        open={openChapterDialog}
        onClose={() => setOpenChapterDialog(false)}
        onCreate={handleCreateChapter}
      />

      {/* Popup tạo bài kiểm tra */}
      {openTestDialog.chapterId !== null && (
        <CreateTestDialog
          open={openTestDialog.open}
          onClose={() => setOpenTestDialog({ open: false, chapterId: null })}
          onCreate={(testName) => {
            if (openTestDialog.chapterId) handleCreateTest(openTestDialog.chapterId, testName);
          }}
        />
      )}

      {/* Popup tạo bài luyện tập */}
      {openPracticeDialog.chapterId !== null && (
        <CreateTestDialog
          open={openPracticeDialog.open}
          onClose={() => setOpenPracticeDialog({ open: false, chapterId: null })}
          onCreate={(practiceName) => {
            if (openPracticeDialog.chapterId) handleCreatePractice(openPracticeDialog.chapterId, practiceName);
          }}
        />
      )}
    </Box>
  );
}

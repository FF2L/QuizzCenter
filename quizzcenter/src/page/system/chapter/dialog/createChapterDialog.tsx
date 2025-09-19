// CreateChapterDialog.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (chapterName: string) => void;
}

export default function CreateChapterDialog({ open, onClose, onCreate }: Props) {
  const [chapterName, setChapterName] = useState("");

  const handleCreate = () => {
    if (chapterName.trim() === "") return;
    onCreate(chapterName);
    setChapterName("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Tạo Chương Mới</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          label="Tên chương"
          fullWidth
          value={chapterName}
          onChange={(e) => setChapterName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleCreate} variant="contained">Tạo</Button>
      </DialogActions>
    </Dialog>
  );
}

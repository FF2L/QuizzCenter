import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from "@mui/material";
import React, { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (testName: string) => void;
}

export default function CreateTestDialog({ open, onClose, onCreate }: Props) {
  const [name, setName] = useState("");

  const handleCreate = () => {
    if (name.trim() !== "") {
      onCreate(name.trim());
      setName("");
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Tạo bài kiểm tra</DialogTitle>
      <DialogContent>
        <TextField
          label="Tên bài kiểm tra"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={handleCreate}>Tạo</Button>
      </DialogActions>
    </Dialog>
  );
}

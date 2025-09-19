import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  IconButton,
  Stack,
  Checkbox,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";

interface DapAnInput {
  noiDung: string;
  dapAnDung: boolean;
}

interface DialogCreateProps {
  open: boolean;
  onClose: () => void;
  idChuong: number;
  onCreated: (cauHoi: any) => void; // trả về câu hỏi kèm đáp án
}

const LOAI_CAU_HOI = [
  { value: "MotDung", label: "Single Answer" },
  { value: "NhieuDung", label: "MultiChoice Answer" },
];

const DO_KHO = [
  { value: "De", label: "Dễ" },
  { value: "Kho", label: "Khó" },
];

const CreateQuestionDialog: React.FC<DialogCreateProps> = ({
  open,
  onClose,
  idChuong,
  onCreated,
}) => {
  const [noiDungCauHoi, setNoiDungCauHoi] = useState("");
  const [loaiCauHoi, setLoaiCauHoi] = useState("MotDung");
  const [doKho, setDoKho] = useState("De");
  const [dapAns, setDapAns] = useState<DapAnInput[]>([]);

  const handleAddAnswer = () => {
    setDapAns([...dapAns, { noiDung: "", dapAnDung: false }]);
  };

  const handleChangeAnswer = (index: number, value: string) => {
    const newAns = [...dapAns];
    newAns[index].noiDung = value;
    setDapAns(newAns);
  };

  const handleToggleCorrect = (index: number) => {
    if (loaiCauHoi === "MotDung") {
      setDapAns(dapAns.map((d, i) => ({ ...d, dapAnDung: i === index })));
    } else {
      const newAns = [...dapAns];
      newAns[index].dapAnDung = !newAns[index].dapAnDung;
      setDapAns(newAns);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!noiDungCauHoi.trim()) {
      alert("Nội dung câu hỏi không được để trống!");
      return;
    }
  
    if (dapAns.length < 1) {
      alert("Phải có ít nhất 1 đáp án!");
      return;
    }
  
    const numCorrect = dapAns.filter(d => d.dapAnDung).length;
    if (numCorrect === 0) {
      alert("Phải có ít nhất 1 đáp án đúng!");
      return;
    }
    if (loaiCauHoi === "MotDung" && numCorrect > 1) {
      alert("Câu hỏi một đáp án chỉ được chọn 1 đáp án đúng!");
      return;
    }
  
    const body = {
      tenHienThi: `Câu mới`,
      noiDungCauHoi: noiDungCauHoi.trim(),
      loaiCauHoi: loaiCauHoi || "MotDung",
      doKho: doKho || "De",
      idChuong,
      mangDapAn: dapAns.map(d => ({
        noiDung: d.noiDung.trim(),
        dapAnDung: d.dapAnDung
      }))
    };
  
    console.log("Payload gửi lên backend:", JSON.stringify(body, null, 2));
  
    try {
      const res = await fetch("http://localhost:3000/cau-hoi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
  
      if (!res.ok) {
        const errText = await res.text();
        console.error("Server trả lỗi:", errText);
        throw new Error(`HTTP ${res.status}: ${errText}`);
      }
  
      const data = await res.json();
      console.log("Backend trả về:", data);
      alert("Thêm câu hỏi thành công!");
  
      // Cập nhật UI
      onCreated(data);
      onClose();
  
      // reset form
      setNoiDungCauHoi("");
      setLoaiCauHoi("MotDung");
      setDoKho("De");
      setDapAns([]);
    } catch (err: any) {
      console.error("Lỗi khi thêm câu hỏi:", err);
      alert("Thêm câu hỏi thất bại! " + err.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Tạo câu hỏi
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Nội dung câu hỏi"
            fullWidth
            multiline
            rows={3}
            value={noiDungCauHoi}
            onChange={(e) => setNoiDungCauHoi(e.target.value)}
          />
          <TextField
            select
            label="Loại câu hỏi"
            value={loaiCauHoi}
            onChange={(e) => setLoaiCauHoi(e.target.value)}
          >
            {LOAI_CAU_HOI.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
          </TextField>
          <TextField
            select
            label="Độ khó"
            value={doKho}
            onChange={(e) => setDoKho(e.target.value)}
          >
            {DO_KHO.map(opt => <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>)}
          </TextField>

          <Typography fontWeight="bold">Danh sách đáp án:</Typography>
          <Stack spacing={1}>
            {dapAns.map((d, index) => (
              <Stack key={index} direction="row" spacing={1} alignItems="center">
                <Checkbox checked={d.dapAnDung} onChange={() => handleToggleCorrect(index)} />
                <TextField
                  fullWidth
                  placeholder={`Đáp án ${index + 1}`}
                  value={d.noiDung}
                  onChange={(e) => handleChangeAnswer(index, e.target.value)}
                />
              </Stack>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddAnswer}
              sx={{ alignSelf: "flex-start" }}
            >
              Thêm đáp án
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={handleSave}>Lưu</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateQuestionDialog;

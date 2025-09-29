// UpdateQuestionDialog.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem, IconButton, Stack,
  Checkbox, Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { DapAn, CauHoi, CauHoiPayload } from "../../../common/model";

interface UpdateProps {
  open: boolean;
  onClose: () => void;
  cauHoiId: number;
  onUpdated: (payload: { cauHoi: CauHoi; dapAn: DapAn[] }) => void;
}

const DO_KHO = [
  { value: "De", label: "Dễ" },
  { value: "Kho", label: "Khó" },
];

const UpdateQuestionDialog: React.FC<UpdateProps> = ({ open, onClose, cauHoiId, onUpdated }) => {
  const [cauHoi, setCauHoi] = useState<CauHoi | null>(null);
  const [dapAn, setDapAn] = useState<DapAn[]>([]);
  const [noiDungHTML, setNoiDungHTML] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && cauHoiId) {
      setLoading(true);
      fetch(`http://localhost:3000/cau-hoi/${cauHoiId}`)
        .then(res => {
          if (!res.ok) throw new Error(`Fetch cau-hoi/${cauHoiId} failed: ${res.status}`);
          return res.json();
        })
        .then((data: CauHoiPayload) => {
          setCauHoi(data.cauHoi);
          setNoiDungHTML(data.cauHoi.noiDungCauHoiHTML || "");
          setDapAn(data.dapAn || []);
        })
        .catch(err => {
          console.error("Lỗi fetch chi tiết câu hỏi:", err);
          alert("Lấy chi tiết câu hỏi thất bại");
        })
        .finally(() => setLoading(false));
    } else if (!open) {
      setCauHoi(null);
      setDapAn([]);
      setSelectedFiles([]);
    }
  }, [open, cauHoiId]);

  if (!cauHoi) return null;

  // ====== HANDLERS ======
  const handleChangeField = (field: keyof CauHoi, value: any) => {
    setCauHoi({ ...cauHoi, [field]: value });
  };

  const handleChangeAnswer = (index: number, plain: string, html: string) => {
    const newAns = [...dapAn];
    newAns[index] = { ...newAns[index], noiDung: plain, noiDungHTML: html };
    setDapAn(newAns);
  };

  const handleToggleCorrect = (index: number) => {
    let newAns = [...dapAn];
    if (cauHoi.loaiCauHoi === "MotDung") {
      newAns = newAns.map((a, i) => ({ ...a, dapAnDung: i === index }));
    } else {
      newAns[index] = { ...newAns[index], dapAnDung: !newAns[index].dapAnDung };
    }
    setDapAn(newAns);
  };

  const handleAddAnswer = () => {
    const newA: DapAn = {
      id: 0,
      create_at: "",
      update_at: "",
      delete_at: null,
      noiDung: "",
      noiDungHTML: "",
      dapAnDung: false,
      idCauHoi: cauHoi.id,
    };
    setDapAn([...dapAn, newA]);
  };

  const handleDeleteAnswer = async (answer: DapAn, index: number) => {
    try {
      if (answer.id && answer.id > 0) {
        const response = await fetch(`http://localhost:3000/dap-an/${answer.id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error(`Delete dapan ${answer.id} failed`);
      }
      setDapAn(prev => prev.filter((_, i) => i !== index));
    } catch (err) {
      console.error("Xóa đáp án thất bại:", err);
      alert("Xóa đáp án thất bại: " + (err as Error).message);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  // SAVE
  const handleSave = async () => {
    if (!cauHoi) return;
    setLoading(true);
    try {
      const formData = new FormData();

      const createCauHoi = {
        ...cauHoi,
        noiDungCauHoiHTML: noiDungHTML,
        mangDapAn: dapAn.map(d => ({
          id: d.id > 0 ? d.id : undefined,
          noiDung: d.noiDung,
          noiDungHTML: d.noiDungHTML,
          dapAnDung: d.dapAnDung,
          idCauHoi: cauHoi.id,
        })),
      };

      formData.append("createCauHoi", JSON.stringify(createCauHoi));
      selectedFiles.forEach(f => formData.append("files", f));

      const res = await fetch(`http://localhost:3000/cau-hoi/${cauHoi.id}`, {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) throw new Error(`Update failed: ${res.status}`);
      const updated: CauHoiPayload = await res.json();

      alert("Cập nhật thành công!");
      onUpdated({ cauHoi: updated.cauHoi, dapAn: updated.dapAn });
      onClose();
    } catch (err) {
      console.error("Lỗi khi update:", err);
      alert("Update thất bại: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Cập nhật câu hỏi
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Tên hiển thị"
            fullWidth
            value={cauHoi.tenHienThi}
            onChange={(e) => handleChangeField("tenHienThi", e.target.value)}
          />

          <Typography fontWeight="bold">Nội dung câu hỏi:</Typography>
          <ReactQuill
            value={noiDungHTML}
            onChange={(html) => {
              setNoiDungHTML(html);
              handleChangeField("noiDungCauHoiHTML", html);
            }}
            theme="snow"
          />

          <TextField
            label="Loại câu hỏi"
            value={cauHoi.loaiCauHoi}
            disabled
          />
          <TextField
            select
            label="Độ khó"
            value={cauHoi.doKho}
            onChange={(e) => handleChangeField("doKho", e.target.value)}
          >
            {DO_KHO.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>

          <Typography fontWeight="bold">Danh sách đáp án:</Typography>
          <Stack spacing={2}>
            {dapAn.map((d, index) => (
              <Stack key={index} spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Checkbox
                    checked={!!d.dapAnDung}
                    onChange={() => handleToggleCorrect(index)}
                  />
                  <Button color="error" onClick={() => handleDeleteAnswer(d, index)}>
                    Xóa
                  </Button>
                </Stack>
                <TextField
                  fullWidth
                  placeholder={`Đáp án ${index + 1} (plain text)`}
                  value={d.noiDung}
                  onChange={(e) =>
                    handleChangeAnswer(index, e.target.value, d.noiDungHTML || "")
                  }
                />
                <ReactQuill
                  value={d.noiDungHTML || ""}
                  onChange={(html) => handleChangeAnswer(index, d.noiDung, html)}
                  theme="snow"
                />
              </Stack>
            ))}
            <Button startIcon={<AddIcon />} onClick={handleAddAnswer}>
              Thêm đáp án
            </Button>
          </Stack>

          <Typography fontWeight="bold">File đính kèm:</Typography>
          <input type="file" multiple onChange={handleFileChange} />
          {selectedFiles.length > 0 && (
            <Typography variant="body2">
              Đã chọn {selectedFiles.length} file
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Hủy</Button>
        <Button variant="contained" onClick={handleSave} disabled={loading}>
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateQuestionDialog;

import React, { useCallback, useMemo, useRef, useState } from "react";
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
  Box,
  Checkbox,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";
import { CauHoiPayload } from "../../../common/model";

interface DapAnInput {
  noiDung: string;
  dapAnDung: boolean;
}

interface DialogCreateProps {
  open: boolean;
  onClose: () => void;
  idChuong: number;
  onCreated: (cauHoi: any) => void;
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
  const [tenHienThi, setTenHienThi] = useState("");
  const [noiDungCauHoi, setNoiDungCauHoi] = useState("");
  const [loaiCauHoi, setLoaiCauHoi] = useState("MotDung");
  const [doKho, setDoKho] = useState("De");
  const [dapAns, setDapAns] = useState<DapAnInput[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const quillRef = useRef<ReactQuill | null>(null);

  // ---- Image Handler ----
  const imageHandler = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();
  
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
  
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result;
        if (!base64) return;
  
        const editor = quillRef.current?.getEditor();
        if (!editor) return;
  
        const range = editor.getSelection();
        const insertIndex = range ? range.index : editor.getLength();
  
        // Thêm file vào mảng trước, lấy index chuẩn
        setFiles((prev) => {
          const newFiles = [...prev, file];
          const currentFileIndex = newFiles.length - 1;
  
          // Insert ảnh Base64
          editor.insertEmbed(insertIndex, "image", base64, "user");
  
          // Lấy ngay ảnh vừa insert (thường là cuối cùng)
          const imgs = editor.root.querySelectorAll("img");
          const lastImg = imgs[imgs.length - 1] as HTMLImageElement;
          if (lastImg) lastImg.setAttribute("data-file-index", currentFileIndex.toString());
  
          return newFiles;
        });
      };
  
      reader.readAsDataURL(file);
    };
  }, []);
  
  

  // ---- Modules (useMemo để tránh remount Quill) ----
  const quillModules = useMemo(() => {
    return {
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ align: [] }],
          ["link", "image"],
          ["clean"],
        ],
        handlers: {
          image: imageHandler, // chỉ dùng handler đã memo
        },
      },
    };
  }, [imageHandler]);
  
  console.log(quillRef.current); // xem có instance nào thừa không

  const handleQuillChange = (content: string) => {
    setNoiDungCauHoi(content);
  };

  const handleAddAnswer = () => {
    setDapAns((prev) => [...prev, { noiDung: "", dapAnDung: false }]);
  };

  const handleChangeAnswer = (index: number, value: string) => {
    setDapAns((prev) => {
      const copy = [...prev];
      copy[index].noiDung = value;
      return copy;
    });
  };

  const handleToggleCorrect = (index: number) => {
    setDapAns((prev) =>
      prev.map((d, i) => ({
        ...d,
        dapAnDung:
          loaiCauHoi === "MotDung"
            ? i === index
            : i === index
            ? !d.dapAnDung
            : d.dapAnDung,
      }))
    );
  };

  const htmlToPlainText = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return (div.textContent || div.innerText || "").trim();
  };

  const handleSave = async () => {
    if (!noiDungCauHoi || noiDungCauHoi === "<p><br></p>") {
      alert("Nội dung câu hỏi không được để trống!");
      return;
    }
  
    if (dapAns.length < 1) {
      alert("Phải có ít nhất 1 đáp án!");
      return;
    }
  
    const numCorrect = dapAns.filter((d) => d.dapAnDung).length;
    if (numCorrect === 0) {
      alert("Phải có ít nhất 1 đáp án đúng!");
      return;
    }
    if (loaiCauHoi === "MotDung" && numCorrect > 1) {
      alert("Câu hỏi một đáp án chỉ được chọn 1 đáp án đúng!");
      return;
    }
  
    const createCauHoi = {
      tenHienThi: tenHienThi.trim(),
      noiDungCauHoi: noiDungCauHoi.replace(/<[^>]+>/g, ""), // plain text
      noiDungCauHoiHTML: noiDungCauHoi, // HTML gốc có style
      loaiCauHoi,
      doKho,
      idChuong,
      mangDapAn: dapAns.map((d) => ({
        noiDung: d.noiDung.trim(),
        noiDungHTML: d.noiDung,
        dapAnDung: d.dapAnDung,
      })),
    };
  
    try {
      const editor = quillRef.current?.getEditor();
      if (!editor) throw new Error("Editor chưa khởi tạo");
  
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
  
      // thay src Base64 bằng //:0 nhưng giữ data-file-index
      const tempHTML = editor.root.innerHTML.replace(
        /(<img [^>]*?)src="data:image[^"]+"/g,
        '$1src="//:0"'
      );
  
      const createCauHoiTemp = { ...createCauHoi, noiDungCauHoiHTML: tempHTML };
      formData.append("createCauHoi", JSON.stringify(createCauHoiTemp));
  
      const res = await fetch("http://localhost:3000/cau-hoi", {
        method: "POST",
        body: formData,
      });
  
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }
  
      const data: CauHoiPayload = await res.json();
  
      // backend trả URL → cập nhật HTML editor
      if (editor && data.mangFileDinhKem) {
        data.mangFileDinhKem.forEach((f, idx) => {
          const imgs = editor.root.querySelectorAll(`img[data-file-index="${idx}"]`);
          imgs.forEach((imgEl: Element) => {
            const img = imgEl as HTMLImageElement;
            img.src = f.duongDan;
            img.style.width = "100%";
            img.style.height = "auto";
          });
        });
  
        setNoiDungCauHoi(editor.root.innerHTML);
        createCauHoi.noiDungCauHoiHTML = editor.root.innerHTML;
      }
  
      alert("Thêm câu hỏi thành công!");
      onCreated(data);
      onClose();
  
      // reset form
      setTenHienThi("");
      setNoiDungCauHoi("");
      setLoaiCauHoi("MotDung");
      setDoKho("De");
      setDapAns([]);
      setFiles([]);
    } catch (err: any) {
      console.error(err);
      alert("Thêm câu hỏi thất bại: " + err.message);
    }
  };
  

  
  return (
    <Dialog open={open} onClose={onClose} fullWidth disableEnforceFocus disableAutoFocus>
      <DialogTitle>
        Tạo câu hỏi
        <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Box>
            <Typography>Tên hiển thị</Typography>
            <TextField
              label="Tên hiển thị"
              fullWidth
              value={tenHienThi}
              onChange={(e) => setTenHienThi(e.target.value)}
            />
          </Box>

          <Box sx={{ minHeight: 200 }}>
            <Typography>Nội dung câu hỏi</Typography>
            <ReactQuill
              ref={quillRef}
              value={noiDungCauHoi}
              onChange={handleQuillChange}
              modules={quillModules}
              theme="snow"
              placeholder="Nhập nội dung câu hỏi..."
            />
          </Box>

          <TextField select label="Loại câu hỏi" value={loaiCauHoi} onChange={(e) => setLoaiCauHoi(e.target.value)}>
            {LOAI_CAU_HOI.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>

          <TextField select label="Độ khó" value={doKho} onChange={(e) => setDoKho(e.target.value)}>
            {DO_KHO.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>

          <Typography fontWeight="bold">Danh sách đáp án:</Typography>
          <Stack spacing={1}>
          {dapAns.map((d, index) => (
  <Box key={index} sx={{ mb: 1, border: "1px solid #ddd", borderRadius: 1, p: 1 }}>
    <Stack direction="row" spacing={1} alignItems="center">
      <Checkbox checked={d.dapAnDung} onChange={() => handleToggleCorrect(index)} />
      <Box sx={{ flex: 1 }}>
        <ReactQuill
          value={d.noiDung}
          onChange={(value) => handleChangeAnswer(index, value)}
          modules={quillModules} // dùng toolbar giống câu hỏi
          theme="snow"
          placeholder={`Đáp án ${index + 1}`}
        />
      </Box>
      <IconButton
        onClick={() => setDapAns((prev) => prev.filter((_, i) => i !== index))}
        size="small"
      >
        <CloseIcon />
      </IconButton>
    </Stack>
  </Box>
))}

            <Button startIcon={<AddIcon />} onClick={handleAddAnswer} sx={{ alignSelf: "flex-start" }}>
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

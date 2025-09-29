
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
  const [noiDungCauHoi, setNoiDungCauHoi] = useState(""); // HTML
  const [loaiCauHoi, setLoaiCauHoi] = useState("MotDung");
  const [doKho, setDoKho] = useState("De");
  const [dapAns, setDapAns] = useState<DapAnInput[]>([]);
  const [images, setImages] = useState<{ file: File; url: string }[]>([]);

  const quillRef = useRef<ReactQuill | null>(null);

  // ---- Handler chèn ảnh ----
  const imageHandler = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;

      const editor = quillRef.current?.getEditor();
      if (!editor) return;

      const range = editor.getSelection();
      const insertIndex = range ? range.index : editor.getLength();

      const blobUrl = URL.createObjectURL(file);
      console.log("Blob URL:", blobUrl);


      editor.insertEmbed(insertIndex, "image", blobUrl);

      const imgs = editor.root.querySelectorAll(`img[src="${blobUrl}"]`);
      imgs.forEach((imgEl) => {
        const img = imgEl as HTMLImageElement;
        img.onload = () => {
          img.style.width = "300px";
          img.style.height = "auto";
        };
      });

      setImages((prev) => [...prev, { file, url: blobUrl }]);
    };
  };

  const quillModules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ align: [] }],
          ["link", "image"],
          ["clean"],
        ],
        handlers: { image: imageHandler },
      },
    }),
    []
  );

  const quillFormats = useMemo(
    () => [
      "header",
      "bold",
      "italic",
      "underline",
      "strike",
      "list",
      "bullet",
      "align",
      "link",
      "image",
    ],
    []
  );

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
      noiDungCauHoi: htmlToPlainText(noiDungCauHoi),
      noiDungCauHoiHTML: noiDungCauHoi,
      loaiCauHoi,
      doKho,
      idChuong,
      mangDapAn: dapAns.map((d) => ({
        noiDung: d.noiDung.trim(),
        noiDungHTML: d.noiDung,
        dapAnDung: d.dapAnDung,
      })),
    };

    const formData = new FormData();
    images.forEach((i) => formData.append("files", i.file));
    formData.append("createCauHoi", JSON.stringify(createCauHoi));

    try {
      const res = await fetch("http://localhost:3000/cau-hoi", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const data: CauHoiPayload = await res.json();

      // ---- Cập nhật URL thật trong editor ----
      const editor = quillRef.current?.getEditor();
      if (editor && data.mangFileDinhKem) {
        data.mangFileDinhKem.forEach((f) => {
          const imgObj = images.find((i) => i.file.name === f.tenFile);
          if (!imgObj) return;
          const imgs = editor.root.querySelectorAll(`img[src="${imgObj.url}"]`);
          imgs.forEach((imgEl) => {
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

      // reset state
      setTenHienThi("");
      setNoiDungCauHoi("");
      setLoaiCauHoi("MotDung");
      setDoKho("De");
      setDapAns([]);
      setImages([]);
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
              formats={quillFormats}
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

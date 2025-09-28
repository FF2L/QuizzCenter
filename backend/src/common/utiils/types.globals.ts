import { DoKho } from "../enum/dokho.enum";
import { LoaiCauHoi } from "../enum/loaicauhoi.enum";

export type RawRow = {
  'Tên hiển thị'?: string;
  'Nội dung câu hỏi': string;
  'Loại câu hỏi': string;         // TRẮC_NGHIỆM / NHIỀU_ĐÁP_ÁN / TỰ_LUẬN (tùy enum của bạn)
  'Độ khó'?: string | number;     // vd: DỄ / TRUNG_BÌNH / KHÓ hoặc 1..5
  'Đáp án đúng'?: string | number; // 'A' | 'B' | 1..8 | hoặc nội dung đáp án
  'Đáp án A'?: string; 'Đáp án B'?: string; 'Đáp án C'?: string; 'Đáp án D'?: string;
  'Đáp án E'?: string; 'Đáp án F'?: string; 'Đáp án G'?: string; 'Đáp án H'?: string;
};

export type NormalizedItem = {
  tenHienThi?: string;
  noiDungCauHoi: string;
  loaiCauHoi: LoaiCauHoi;
  doKho: DoKho;
  answers: Array<{ thuTu: number; noiDung: string; dung: boolean }>;
};
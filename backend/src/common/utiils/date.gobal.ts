import { BadRequestException } from '@nestjs/common';
import * as XLSX from 'xlsx';

export function excelToDate(excelDate: any): Date | null {
  if (!excelDate) return null;

  // Đã là Date thì trả luôn
  if (excelDate instanceof Date) return excelDate;

  // Nếu là chuỗi: dd/MM/yyyy hoặc dd-MM-yyyy
  if (typeof excelDate === 'string') {
    const trimmed = excelDate.trim();
    if (!trimmed) return null;

    const parts = trimmed.split(/[\/\-]/); // tách theo / hoặc -
    if (parts.length !== 3) {
      throw new BadRequestException(`Ngày sinh không đúng định dạng (dd/MM/yyyy): "${excelDate}"`);
    }

    const [dayStr, monthStr, yearStr] = parts;
    const day = Number(dayStr);
    const month = Number(monthStr);
    const year = Number(yearStr);

    if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
      throw new BadRequestException(`Ngày sinh không hợp lệ (không phải số): "${excelDate}"`);
    }

    // Kiểm tra phạm vi cơ bản
    if (month < 1 || month > 12) {
      throw new BadRequestException(`Tháng không hợp lệ (1–12): "${excelDate}"`);
    }
    if (day < 1 || day > 31) {
      throw new BadRequestException(`Ngày không hợp lệ (1–31): "${excelDate}"`);
    }

    const date = new Date(year, month - 1, day);

    // ✅ Quan trọng: kiểm tra lại xem date có đúng như mình truyền vào không
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      throw new Error(`Ngày sinh không tồn tại trong lịch: "${excelDate}"`);
    }

    return date;
  }

  // Nếu là số serial của Excel
  if (typeof excelDate === 'number') {
    const parsed = XLSX.SSF.parse_date_code(excelDate);
    if (!parsed) {
      throw new Error(`Không parse được giá trị ngày: "${excelDate}"`);
    }
    const date = new Date(parsed.y, parsed.m - 1, parsed.d);

    // kiểm tra lại cho chắc
    if (
      date.getFullYear() !== parsed.y ||
      date.getMonth() !== parsed.m - 1 ||
      date.getDate() !== parsed.d
    ) {
      throw new Error(`Ngày không hợp lệ từ serial Excel: "${excelDate}"`);
    }

    return date;
  }

  throw new Error(`Định dạng ngày không hỗ trợ: ${typeof excelDate}`);
}

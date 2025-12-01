import * as XLSX from 'xlsx';

export function excelToDate(excelDate: any): Date | null {
  if (!excelDate) return null;

  // Nếu đã là Date rồi thì trả luôn
  if (excelDate instanceof Date) return excelDate;

  // Nếu là chuỗi dạng dd/MM/yyyy hoặc dd-MM-yyyy
  if (typeof excelDate === 'string') {
    const trimmed = excelDate.trim();
    if (!trimmed) return null;

    const parts = trimmed.split(/[\/\-]/); // tách theo / hoặc -
    if (parts.length !== 3) {
      throw new Error(`Ngày sinh không đúng định dạng (dd/MM/yyyy): "${excelDate}"`);
    }

    const [dayStr, monthStr, yearStr] = parts;
    const day = Number(dayStr);
    const month = Number(monthStr);
    const year = Number(yearStr);

    const date = new Date(year, month - 1, day); // JS: month 0–11
    if (isNaN(date.getTime())) {
      throw new Error(`Ngày sinh không hợp lệ: "${excelDate}"`);
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
    return date;
  }

  throw new Error(`Định dạng ngày không hỗ trợ: ${typeof excelDate}`);
}

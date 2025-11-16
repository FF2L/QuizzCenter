import * as XLSX from 'xlsx';
export function excelDateToString(excelDate: any): string {
    if (!excelDate) return '';

    // Trường hợp nhập dạng dd/mm/yyyy chữ trong excel → giữ nguyên
    if (typeof excelDate === 'string') return excelDate;

    // Excel lưu ngày dưới dạng số → convert
    const date = XLSX.SSF.parse_date_code(excelDate);

    const day = String(date.d).padStart(2, '0');
    const month = String(date.m).padStart(2, '0');
    const year = date.y;

    return `${day}/${month}/${year}`;
  }

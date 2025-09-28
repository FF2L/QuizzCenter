export const DEFAULT_PAGE_LIMIT = 10;

export const ACCEPTED_MIME_EXCEL = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // 1 số trình duyệt sẽ gửi loại này
  'text/csv', 'application/csv', 'application/octet-stream', // CSV fallback
]);

export const ACCEPTED_MIME_IMG = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
export const MAX_IMAGE_SIZE = Number(5 * 1024 * 1024);
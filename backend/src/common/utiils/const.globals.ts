import { BadRequestException } from "@nestjs/common";

export const DEFAULT_PAGE_LIMIT = 10;

export const ACCEPTED_MIME_EXCEL = new Set([
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
  'application/vnd.ms-excel', 
  'text/csv', 'application/csv', 'application/octet-stream', 
]);

export const excelFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(xlsx)$/)) {
    return callback(new BadRequestException('Chỉ hỗ trợ file .xlsx'), false);
  }
  callback(null, true);
};


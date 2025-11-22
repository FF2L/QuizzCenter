import { BadRequestException, Injectable, NotFoundException, Inject, InternalServerErrorException } from '@nestjs/common';
import { CreateGuiFileDto } from './dto/create-gui-file.dto';
import { UpdateGuiFileDto } from './dto/update-gui-file.dto';
import { DataSource } from 'typeorm';
import {NormalizedItem, RawRow } from 'src/common/utiils/types.globals';
import * as XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';
import { DapAn } from 'src/dap-an/entities/dap-an.entity';
import { CauHoi } from 'src/cau-hoi/entities/cau-hoi.entity';
import { LoaiCauHoi } from 'src/common/enum/loaicauhoi.enum';
import { DoKho } from 'src/common/enum/dokho.enum';
import { Chuong } from 'src/chuong/entities/chuong.entity';
import { v2 as Cloudinary, UploadApiOptions, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';


type Normalized = { items: NormalizedItem[] };

@Injectable()
export class GuiFileService {

  constructor(private readonly dataSource: DataSource,
    @Inject('CLOUDINARY') private cloudianry: typeof Cloudinary
  ) {}

async uploadMotAnh(file: Express.Multer.File): Promise<{ public_id: string; url: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = this.cloudianry.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_FOLDER || 'imagesQuizzCenter',
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result) return reject(error);
        resolve({
          public_id: result.public_id,
          url: result.secure_url,
        });
      },
    );

    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
}


  async xoaAnhTheoId(publicId: string){
      try{
        return await this.cloudianry.uploader.destroy(publicId)
      }catch(error){
        throw new InternalServerErrorException('Lỗi xóa ảnh trên cloudianry')
      }
      
    }
  /**End phần upload ảnh */
parseFileFormat(buffer: Buffer, fileName: string, idChuong: number) {
    const ext = (fileName.split('.').pop() || '').toLowerCase();

    let rows: Array<Record<string, any>>;
    if (ext === 'csv') rows = this.parseCsv(buffer);
    else if (ext === 'xlsx') rows = this.parseXlsx(buffer);
    else throw new BadRequestException('Chỉ hỗ trợ .csv hoặc .xlsx');

    return this.normalize(rows, idChuong);
  }

  // ================== Parsers ==================
  private parseCsv(buffer: Buffer) {
    const text = buffer.toString('utf8');
    return parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as Array<Record<string, any>>;
  }

  private parseXlsx(buffer: Buffer) {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });
  }

  // ============== Normalize to required output ==============
// ============== Normalize to required output ==============
private normalize(rows: Array<Record<string, any>>, idChuong: number) {
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  const thanhCong: any[] = [];
  const thatBai: any[] = [];

  rows.forEach((r, index) => {
    try {
      // ====== VALIDATION CƠ BẢN ======

      // Tên hiển thị
      const tenHienThi = (r['Tên hiển thị'] ?? '').toString().trim();
      if (!tenHienThi) {
        throw new Error('Tên hiển thị không được để trống.');
      }

      // Nội dung câu hỏi
      const noiDungCauHoi = (r['Nội dung câu hỏi'] ?? '').toString().trim();
      if (!noiDungCauHoi) {
        throw new Error('Nội dung câu hỏi không được để trống.');
      }

      // Loại câu hỏi
      const rawLoai = (r['Loại câu hỏi'] ?? '').toString().trim();
      if (!rawLoai) {
        throw new Error('Loại câu hỏi không được để trống.');
      }
      const loaiCauHoi = this.mapLoai(rawLoai); 

      // Độ khó
      const rawDoKho = (r['Độ khó'] ?? '').toString().trim();
      if (!rawDoKho) {
        throw new Error('Độ khó không được để trống.');
      }
      const doKho = this.mapDoKho(rawDoKho); 

      // ====== ĐÁP ÁN A, B, C, ... ======

      // Lấy toàn bộ text trong các cột Đáp án A..H
      const answerStrings = letters.map(L =>
        (r[`Đáp án ${L}`] ?? '').toString().trim()
      );

      // Ít nhất phải có 1 đáp án có nội dung
      const mangDapAn = answerStrings
        .filter(s => s.length > 0)
        .map(s => ({
          noiDung: s,
          noiDungHTML: null as string | null,
          dapAnDung: false,
        }));

      if (mangDapAn.length === 0) {
        throw new Error('Nội dung đáp án không được để trống. Phải có ít nhất 1 đáp án.');
      }

      // Nếu là "Một đúng" thì bắt buộc có đúng 4 đáp án (A, B, C, D)
      if (loaiCauHoi === LoaiCauHoi.MotDung) {
        const first4 = answerStrings.slice(0, 4); // A, B, C, D
        const nonEmptyFirst4 = first4.filter(s => s.length > 0);

        if (nonEmptyFirst4.length !== 4) {
          throw new Error('Câu hỏi loại "Một đúng" phải có đủ 4 đáp án A, B, C, D và không được để trống.');
        }
      }

      // ====== CỘT "Đáp án đúng" ======

      const rawCorrect = (r['Đáp án đúng'] ?? '').toString().trim();
      if (!rawCorrect) {
        throw new Error('Đáp án đúng không được để trống.');
      }

      // Tách theo các dấu , ; | / (ví dụ: "A,B" hoặc "A;B")
      const tokens = rawCorrect
        .split(/[,\;\|\/]/)
        .map(x => x.trim())
        .filter(Boolean);

      if (tokens.length === 0) {
        throw new Error('Đáp án đúng không hợp lệ. Chỉ chấp nhận A,B,C,D,E,F,G,H.');
      }

      let soDapAnDung = 0;

      for (const tkRaw of tokens) {
        const up = tkRaw.toUpperCase();

        // Chỉ chấp nhận chữ cái A..H
        if (!letters.includes(up)) {
          throw new Error('Đáp án đúng không hợp lệ. Chỉ chấp nhận A,B,C,D,E,F,G,H.');
        }

        const idx = letters.indexOf(up);

        // Nếu chọn E/F/G/H nhưng không có nội dung đáp án tương ứng thì cũng lỗi
        if (!answerStrings[idx] || answerStrings[idx].trim().length === 0) {
          throw new Error(
            `Đáp án đúng "${up}" không hợp lệ vì không có nội dung ở cột "Đáp án ${up}".`
          );
        }

        const found = mangDapAn.find(
          a => a.noiDung.trim().toLowerCase() === answerStrings[idx].trim().toLowerCase()
        );

        if (!found) {
          throw new Error(
            `Không tìm thấy đáp án tương ứng với "${up}".`
          );
        }

        found.dapAnDung = true;
        soDapAnDung++;
      }

      if (soDapAnDung === 0) {
        throw new Error('Chưa có đáp án nào được đánh dấu đúng.');
      }

      // Ràng buộc theo loại câu hỏi
      if (loaiCauHoi === LoaiCauHoi.MotDung && soDapAnDung !== 1) {
        throw new Error('Câu hỏi loại "Một đúng" phải có đúng 1 đáp án đúng.');
      }

      // ====== Nếu mọi thứ OK → push vào thanhCong ======
      thanhCong.push({
        tenHienThi,
        noiDungCauHoi,
        noiDungCauHoiHTML: noiDungCauHoi,
        loaiCauHoi,
        doKho,
        idChuong,
        mangDapAn,
      });

    } catch (err: any) {
      // ====== Lỗi → push vào thatBai ======
      thatBai.push({
        rowNumber: index + 2, // +2 vì thường header là dòng 1
        error: err.message || 'Lỗi không xác định',
      });
    }
  });

  return { thanhCong, thatBai };
}



  // ================= Helpers =================
  private letterIndex(s: string): number | null {
    const up = (s || '').trim().toUpperCase();
    const arr = ['A','B','C','D','E','F','G','H'];
    const i = arr.indexOf(up);
    return i === -1 ? null : i;
  }

  private mapDoKho(raw: string): DoKho {
    const s = raw.trim().toLowerCase();
    if (['dễ','de'].includes(s)) return DoKho.De;
    if (['trung bình','trungbinh'].includes(s)) return DoKho.TrungBinh;
    if (['khó','kho'].includes(s)) return DoKho.Kho;
    throw new Error('Độ khó không hợp lệ. Chỉ chấp nhận "Dễ", "Trung bình" hoặc "Khó"');
  }

  private mapLoai(raw: string): LoaiCauHoi {
    const s = raw.trim().toLowerCase();
    if (s.includes('một đúng') || s.includes('mot dung') )
      return LoaiCauHoi.MotDung;
    if (s.includes('nhiều đúng') || s.includes('nhieu dung') )
      return LoaiCauHoi.NhieuDung;
    throw new Error('Loại câu hỏi không hợp lệ. Chỉ chấp nhận "Một đúng" hoặc "Nhiều đúng"');
  }

}

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
  private normalize(rows: Array<Record<string, any>>, idChuong: number) {
    const letters = ['A','B','C','D','E','F','G','H'];

    return rows.map((r) => {
      const tenHienThi = (r['Tên hiển thị'] ?? '').toString().trim() || 'abc';
      const noiDungCauHoi = (r['Nội dung câu hỏi'] ?? '').toString().trim();

      const loaiCauHoi = this.mapLoai((r['Loại câu hỏi'] ?? '').toString());
      const doKho = this.mapDoKho((r['Độ khó'] ?? '').toString());

      // danh sách đáp án A..H (bỏ trống)
      const mangDapAn = letters
        .map(L => (r[`Đáp án ${L}`] ?? '').toString().trim())
        .filter(s => s.length > 0)
        .map(s => ({ noiDung: s, noiDungHTML: null as string | null, dapAnDung: false }));

      // đánh dấu đáp án đúng: "A,B" | "1;3" | theo nội dung
      const rawCorrect = (r['Đáp án đúng'] ?? '').toString().trim();
      const tokens = rawCorrect ? rawCorrect.split(/[,\;\|\/]/).map(x => x.trim()).filter(Boolean) : [];

      for (const tk of tokens) {
        const li = this.letterIndex(tk);
        if (li !== null && mangDapAn[li]) { mangDapAn[li].dapAnDung = true; continue; }

        const n = Number(tk);
        if (!Number.isNaN(n) && mangDapAn[n - 1]) { mangDapAn[n - 1].dapAnDung = true; continue; }

        const f = mangDapAn.find(m => m.noiDung.toLowerCase() === tk.toLowerCase());
        if (f) f.dapAnDung = true;
      }

      return {
        tenHienThi,
        noiDungCauHoi,
        noiDungCauHoiHTML: null,
        loaiCauHoi,                 // "MotDung" | "NhieuDung"
        doKho,                      // "De" | "TrungBinh" | "Kho"
        idChuong,
        mangDapAn,                  // [{noiDung, noiDungHTML:null, dapAnDung}]
      };
    });
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
    if (['dễ','de','easy','1','low'].includes(s)) return DoKho.De;
    if (['trung bình','trungbinh','tb','2','medium'].includes(s)) return DoKho.TrungBinh;
    if (['khó','kho','hard','3','high'].includes(s)) return DoKho.Kho;
    return DoKho.TrungBinh;
  }

  private mapLoai(raw: string): LoaiCauHoi {
    const s = raw.trim().toLowerCase();
    if (s.includes('một đúng') || s.includes('mot dung') || ['1','m','single','one'].includes(s))
      return LoaiCauHoi.MotDung;
    if (s.includes('nhiều đúng') || s.includes('nhieu dung') || ['2','n','multi','multiple'].includes(s))
      return LoaiCauHoi.NhieuDung;
    return LoaiCauHoi.MotDung;
  }

}

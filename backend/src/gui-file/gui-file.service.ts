import { BadRequestException, Injectable } from '@nestjs/common';
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

type Normalized = { items: NormalizedItem[] };

@Injectable()
export class GuiFileService {

  constructor(private readonly dataSource: DataSource) {}

  // --- 3.1 Parse Excel ---
  async parseXlsx(buffer: Buffer): Promise<RawRow[]> {
    try {
      const wb = XLSX.read(buffer, { type: 'buffer' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<RawRow>(sheet, { defval: '' });
      return rows;
    } catch (e) {
      throw new BadRequestException('Không đọc được file Excel.');
    }
  }

  // --- 3.2 Parse CSV (nếu người dùng up CSV) ---
  async parseCsv(buffer: Buffer): Promise<RawRow[]> {
    try {
      const text = buffer.toString('utf8');
      const records = parse(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }) as RawRow[];
      return records;
    } catch (e) {
      throw new BadRequestException('Không đọc được file CSV.');
    }
  }

 // --- Chuẩn hoá về enum + list đáp án ---
 normalizeRows(rows: any[]): Normalized {
  const letters = ['A','B','C','D','E','F','G','H'];

  const items: NormalizedItem[] = rows.map((raw, idx) => {
    // map key chuẩn hoá cho từng row (đọc header "lệch" cũng được)
    const keyMap = this.buildKeyMap(raw);

    const tenHienThi = this.getVal(raw, keyMap, 'Tên hiển thị')?.trim();
    const noiDungCauHoi = this.getVal(raw, keyMap, 'Nội dung câu hỏi')?.trim() || '';
    if (!noiDungCauHoi) {
      throw new BadRequestException(`Hàng ${idx + 2} thiếu "Nội dung câu hỏi".`);
    }

    const loaiCauHoi: LoaiCauHoi = this.mapLoai(
      this.getVal(raw, keyMap, 'Loại câu hỏi')?.toString(),
    );

    const doKho: DoKho = this.mapDoKho(
      this.getVal(raw, keyMap, 'Độ khó')?.toString(),
    );

    // Lấy đáp án A..H
    const answers = letters
      .map((L, i) => {
        const v = this.getVal(raw, keyMap, `Đáp án ${L}`)?.toString().trim();
        return { thuTu: i + 1, noiDung: v, dung: false };
      })
      .filter(a => a.noiDung.length > 0);

    // Đánh dấu đáp án đúng: hỗ trợ "A", "a", "1", "A,B", "1;3", hoặc theo nội dung
    const correctRaw = (this.getVal(raw, keyMap, 'Đáp án đúng') || '').toString().trim();
    const tokens = correctRaw
      ? correctRaw.split(/[,\;\|\/]/).map(x => x.trim()).filter(Boolean)
      : [];

    for (const tk of tokens) {
      const li = this.letterToIndex(tk);
      if (li !== null && answers[li]) {
        answers[li].dung = true;
        continue;
      }
      const n = Number(tk);
      if (!Number.isNaN(n) && answers[n - 1]) {
        answers[n - 1].dung = true;
        continue;
      }
      const found = answers.find(a => a.noiDung.trim().toLowerCase() === tk.toLowerCase());
      if (found) found.dung = true;
    }

    return {
      tenHienThi: tenHienThi || undefined,
      noiDungCauHoi,
      loaiCauHoi,
      doKho,
      answers,
    };
  });

  return { items };
}


  // --- Lưu DB (thêm idChuong) ---
  async saveToDatabase(data: Normalized, idChuong: number) {
    let createdQ = 0, createdA = 0;

    await this.dataSource.transaction(async (manager) => {
      const cauHoiRepo = manager.getRepository(CauHoi);
      const dapAnRepo = manager.getRepository(DapAn);

      for (const it of data.items) {
        // Ràng buộc loại 1 đúng
        if (it.loaiCauHoi === LoaiCauHoi.MotDung) {
          const countCorrect = it.answers.filter(a => a.dung).length;
          if (countCorrect !== 1) {
            throw new BadRequestException(`Câu hỏi "${it.noiDungCauHoi}" phải có đúng 1 đáp án đúng (hiện ${countCorrect}).`);
          }
        }

        const q = cauHoiRepo.create({
          tenHienThi: it.tenHienThi ?? '',
          noiDungCauHoi: it.noiDungCauHoi,
          loaiCauHoi: it.loaiCauHoi,
          doKho: it.doKho,
          idChuong,                            // <— gán chương
        });
        const savedQ = await cauHoiRepo.save(q);
        createdQ++;

        if (it.answers.length) {
          const ansEntities = it.answers.map(a => dapAnRepo.create({
            noiDung: a.noiDung,
            dapAnDung: !!a.dung,
            idCauHoi: savedQ.id,
          }));
          await dapAnRepo.save(ansEntities);
          createdA += ansEntities.length;
        }
      }
    });

    return { createdQuestions: createdQ, createdAnswers: createdA };
  }


  // Helpers
// A..H -> 0..7 ; khác trả null
  private letterToIndex(s: string): number | null {
    const up = (s || '').trim().toUpperCase();
    const letters = ['A','B','C','D','E','F','G','H'];
    const idx = letters.indexOf(up);
    return idx === -1 ? null : idx;
  }
// Chuẩn hoá chuỗi VN để so sánh lỏng (bỏ dấu, gộp space, hạ chữ)
private slugVN(s: string) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')   // bỏ dấu kết hợp
    .replace(/đ/g, 'd')                // <<< quan trọng: đ -> d
    .replace(/Đ/g, 'd')                // (phòng khi có chữ hoa)
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // xoá zero-width, BOM
    .replace(/\u00A0/g, ' ')               // NBSP -> space
    .replace(/[^a-z0-9]+/g, ' ')           // các ký tự còn lại -> space
    .replace(/\s+/g, ' ')
    .trim();
}

// Build keyMap 1 lần cho mỗi row (đọc header "lệch" cũng được)
  private buildKeyMap(row: Record<string, any>): Record<string, string> {
    const map: Record<string, string> = {};
    for (const k of Object.keys(row)) {
      map[this.slugVN(k)] = k;
    }
    return map;
  }
// Lấy giá trị theo "tên cột hiển thị"
  private getVal(row: Record<string, any>, keyMap: Record<string, string>, displayKey: string): any {
    const k = keyMap[this.slugVN(displayKey)];
    return k ? row[k] : undefined;
  }
// Map ĐỘ KHÓ về enum – cũng dùng slug
  private mapDoKho(input?: string): DoKho {
    const s = this.slugVN(input || '');
    if (['de','easy','e','1','low'].includes(s)) return DoKho.De;
    if (['kho','hard','h','2','high'].includes(s)) return DoKho.Kho;
    return DoKho.De; // default
  }
// Map LOẠI về enum – dùng slug để chấp mọi biến thể: "nhiều đúng", "Nhieu  dung", "N", "2",...
private mapLoai(input?: string): LoaiCauHoi {
  const s = this.slugVN(input || '');
  if (s.includes('mot dung') || /^(1|m|single|one)$/.test(s)) return LoaiCauHoi.MotDung;
  if (s.includes('nhieu dung') || /^(2|n|multi|multiple)$/.test(s)) return LoaiCauHoi.NhieuDung;
  return LoaiCauHoi.MotDung;
}


  create(createGuiFileDto: CreateGuiFileDto) {
    return 'This action adds a new guiFile';
  }

  findAll() {
    return `This action returns all guiFile`;
  }

  findOne(id: number) {
    return `This action returns a #${id} guiFile`;
  }

  update(id: number, updateGuiFileDto: UpdateGuiFileDto) {
    return `This action updates a #${id} guiFile`;
  }

  remove(id: number) {
    return `This action removes a #${id} guiFile`;
  }
}

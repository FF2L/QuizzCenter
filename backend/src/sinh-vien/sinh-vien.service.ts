import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSinhVienDto } from './dto/create-sinh-vien.dto';
import { UpdateSinhVienDto } from './dto/update-sinh-vien.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { SinhVien } from './entities/sinh-vien.entity';
import { Repository } from 'typeorm';
import { NguoiDungService } from 'src/nguoi-dung/nguoi-dung.service';

@Injectable()
export class SinhVienService {

  constructor(@InjectRepository(SinhVien) private sinhVienRepo: Repository<SinhVien>,
  private nguoiDungService: NguoiDungService  
){}

  async findOne(id: number) {
    const sinhVien = await this.sinhVienRepo.findOne({
      where: { idNguoiDung: id },
      relations: ['nguoiDung'],
      select: {
        nguoiDung: {
          id: true,
          hoTen: true,
          email: true,
          maNguoiDung:true,
          anhDaiDien:true,
          soDienThoai:true,
          ngaySinh:true,
          vaiTro:true 
        },
      },
    });
    if(!sinhVien) throw new NotFoundException(`Không tìm thấy sinh viên với mã ${id}`)
    return sinhVien;
  }

  async layTatCaSinhVienTheoLopHocPhan(idLopHocPhan: number) {
    return this.sinhVienRepo.find({
      where: { lopHocPhan: { id: idLopHocPhan } },
    });
  }
}

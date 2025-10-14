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

  create(createSinhVienDto: CreateSinhVienDto) {
    return 'This action adds a new sinhVien';
  }
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
          gioiTinh:true,
          soDienThoai:true,
          idKhoa:true,
          ngaySinh:true,
          vaiTro:true 
        },
      },
    });
    if(!sinhVien) throw new NotFoundException(`Không tìm thấy sinh viên với mã ${id}`)
    return sinhVien;
  }

  update(id: number, updateSinhVienDto: UpdateSinhVienDto) {
    return `This action updates a #${id} sinhVien`;
  }

  remove(id: number) {
    return `This action removes a #${id} sinhVien`;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGiangVienDto } from './dto/create-giang-vien.dto';
import { UpdateGiangVienDto } from './dto/update-giang-vien.dto';
import { NguoiDungService } from 'src/nguoi-dung/nguoi-dung.service';
import { InjectRepository } from '@nestjs/typeorm';
import { GiangVien } from './entities/giang-vien.entity';
import { Repository } from 'typeorm';
import { Role } from 'src/common/enum/role.enum';

@Injectable()
export class GiangVienService {

    constructor(private nguoiDungService: NguoiDungService,
      @InjectRepository(GiangVien) private giangVienRepo: Repository<GiangVien>,
      ){}


  async timGiangVienTheoId(idGiangVien: number){
    const giangVien = await this.giangVienRepo.findOne({where: {idNguoiDung: idGiangVien},
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
      },}
    )
    if (!giangVien) throw new NotFoundException('Không tìm thấy giảng viên')
    return giangVien
  }
  async layTatCaGiangVien(){
    return await this.nguoiDungService.layTatCaNguoiDungTheoVaiTro(Role.GiaoVien)
  }

  async layTatCaGiangVienTheoMonHoc(idMonHoc: number){
    const qb =  this.giangVienRepo.createQueryBuilder('gv')
    .leftJoin('gv.monHoc', 'mh')
    .leftJoin('gv.nguoiDung', 'nd')
    .where('mh.id = :idMonHoc', { idMonHoc })
    const danhSachGiangVien =  qb.select([
      'nd.id AS idNguoiDung',
      'nd.hoTen AS hoTen',
    ])
    return  await danhSachGiangVien.getRawMany();
  
  }

  async layTatCaGiangVienKhongPhanTrang(){
    return await this.giangVienRepo.find({
      relations: ['nguoiDung'],
      select: {
        nguoiDung: {
          id: true,
          hoTen: true,
        },
      },
    });
  }
}

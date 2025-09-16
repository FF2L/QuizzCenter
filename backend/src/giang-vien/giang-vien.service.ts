import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGiangVienDto } from './dto/create-giang-vien.dto';
import { UpdateGiangVienDto } from './dto/update-giang-vien.dto';
import { NguoiDungService } from 'src/nguoi-dung/nguoi-dung.service';
import { InjectRepository } from '@nestjs/typeorm';
import { GiangVien } from './entities/giang-vien.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GiangVienService {

    constructor(private nguoiDungService: NguoiDungService,
      @InjectRepository(GiangVien) private giangVienRepo: Repository<GiangVien>,
      ){}


  async timGiangVienTheoId(idGiangVien: number){
    const giangVien = await this.nguoiDungService.timMotNguoiDungTheoId(idGiangVien)
    if (!giangVien) throw new NotFoundException('Không tìm thấy giảng viên')
    return giangVien
  }

  create(createGiangVienDto: CreateGiangVienDto) {
    return 'This action adds a new giangVien';
  }

  findAll() {
    return `This action returns all giangVien`;
  }

  findOne(id: number) {
    return `This action returns a #${id} giangVien`;
  }

  update(id: number, updateGiangVienDto: UpdateGiangVienDto) {
    return `This action updates a #${id} giangVien`;
  }

  remove(id: number) {
    return `This action removes a #${id} giangVien`;
  }
}

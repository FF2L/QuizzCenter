import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLopHocPhanDto } from './dto/create-lop-hoc-phan.dto';
import { UpdateLopHocPhanDto } from './dto/update-lop-hoc-phan.dto';
import { FilterLopHocPhanQueryDto } from './dto/filte-lop-hoc-phan.dto';
import { LopHocPhan } from './entities/lop-hoc-phan.entity';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MonHocService } from 'src/mon-hoc/mon-hoc.service';
import { GiangVienService } from 'src/giang-vien/giang-vien.service';

@Injectable()
export class LopHocPhanService {

  constructor(@InjectRepository(LopHocPhan) private lopHocPhanRep: Repository<LopHocPhan>,
              private monHocService: MonHocService,
              private giangVienService: GiangVienService
){}


  create(createLopHocPhanDto: CreateLopHocPhanDto) {
    return 'This action adds a new lopHocPhan';
  }

  async layTatCaLopHocPhanTheoIdMonHocVaIdGiaoVien(idMonHoc: number, filterLopHocPHan: FilterLopHocPhanQueryDto) {
    await this.monHocService.timMotMonHocTheoId(idMonHoc)
   
    if(filterLopHocPHan.idGiangVien){
      await this.giangVienService.timGiangVienTheoId(filterLopHocPHan.idGiangVien)
      return await this.lopHocPhanRep.find({where: 
        {idGiangVien: filterLopHocPHan.idGiangVien,
           idMonHoc,
          thoiGianKetThuc: MoreThanOrEqual(new Date())}})
    } else{
      return await this.lopHocPhanRep.find({where: {idMonHoc, thoiGianKetThuc: MoreThanOrEqual(new Date())}})
    }
    
  }

  async timMotLopHocPhanTheoId(idlopHocPHan: number){
    const lopHocPhan = await this.lopHocPhanRep.find({where: {id: idlopHocPHan}})
    if (!lopHocPhan) throw new NotFoundException(`Không tìm thấy lớp học phần với ${idlopHocPHan}`)
    return lopHocPhan
  
  }

  findOne(id: number) {
    return `This action returns a #${id} lopHocPhan`;
  }

  update(id: number, updateLopHocPhanDto: UpdateLopHocPhanDto) {
    return `This action updates a #${id} lopHocPhan`;
  }

  remove(id: number) {
    return `This action removes a #${id} lopHocPhan`;
  }
}

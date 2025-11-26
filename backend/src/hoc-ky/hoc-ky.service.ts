import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateHocKyDto } from './dto/create-hoc-ky.dto';
import { UpdateHocKyDto } from './dto/update-hoc-ky.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { HocKy } from './entities/hoc-ky.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HocKyService {
  constructor(@InjectRepository(HocKy) private hocKyRepository: Repository<HocKy>){}
  async create(createHocKyDto: CreateHocKyDto) {
    const {tenHocKy, thoiGianBatDau, thoiGianKetThuc, phatHanh} = createHocKyDto;
    try {      
      const hocKy = this.hocKyRepository.create({
        tenHocKy,
        thoiGianBatDau,
        thoiGianKetThuc,
        phatHanh
      });
      return await this.hocKyRepository.save(hocKy);
      
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Lỗi tạo học kỳ');
    }
  }

  async findAll() {
    try{
      return await this.hocKyRepository.find();
    }catch(error){
      console.log(error);
      throw new InternalServerErrorException('Lỗi lấy danh sách học kỳ');
    }
  }

  async findAllHocKyPhatHanh() {
    try{
      return await this.hocKyRepository.find({
        where:{
          phatHanh:true
        }
      });
    }catch(error){
      console.log(error);
      throw new InternalServerErrorException('Lỗi lấy danh sách học kỳ phát hành');
    }
  }

  async update(id: number, updateHocKyDto: UpdateHocKyDto) {
    try{
      const hocKy = await this.hocKyRepository.findOneBy({id});
      if(!hocKy){
        throw new InternalServerErrorException('Học kỳ không tồn tại');
      }
      return await this.hocKyRepository.update(id, updateHocKyDto);  
    }catch(error){
      console.log(error);
      throw new InternalServerErrorException('Lỗi cập nhật học kỳ');
    }
  }

  remove(id: number) {
    try{
      return this.hocKyRepository.delete(id);
    }catch(error){
      console.log(error);
      throw new InternalServerErrorException('Lỗi xóa học kỳ');
    }
  }
}

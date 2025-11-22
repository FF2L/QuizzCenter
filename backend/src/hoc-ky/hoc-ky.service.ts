import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateHocKyDto } from './dto/create-hoc-ky.dto';
import { UpdateHocKyDto } from './dto/update-hoc-ky.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { HocKy } from './entities/hoc-ky.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HocKyService {
  constructor(@InjectRepository(HocKy) private hocKyRepository: Repository<HocKy>){}
  create(createHocKyDto: CreateHocKyDto) {
    const {tenHocKy, thoiGianBatDau, thoiGianKetThuc, phatHanh} = createHocKyDto;
    try {
      const hocKy = this.hocKyRepository.create({
        tenHocKy,
        thoiGianBatDau,
        thoiGianKetThuc,
        phatHanh
      });
      return this.hocKyRepository.save(hocKy);
      
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException('Lỗi tạo học kỳ');
    }

    return 'This action adds a new hocKy';
  }

  findAll() {
    return `This action returns all hocKy`;
  }

  findAllHocKyPhatHanh() {
    return `This action returns all hocKy phat hanh`;
  }

  update(id: number, updateHocKyDto: UpdateHocKyDto) {
    return `This action updates a #${id} hocKy`;
  }

  remove(id: number) {
    return `This action removes a #${id} hocKy`;
  }
}

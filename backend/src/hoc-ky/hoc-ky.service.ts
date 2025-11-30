import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateHocKyDto } from './dto/create-hoc-ky.dto';
import { UpdateHocKyDto } from './dto/update-hoc-ky.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { HocKy } from './entities/hoc-ky.entity';
import { ILike, LessThanOrEqual, Like, MoreThan, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { LopHocPhan } from 'src/lop-hoc-phan/entities/lop-hoc-phan.entity';

@Injectable()
export class HocKyService {
  constructor(
    @InjectRepository(HocKy) private hocKyRepository: Repository<HocKy>,
    @InjectRepository(LopHocPhan) private lopHocPhanRepository: Repository<LopHocPhan>
  ){}
  
  async checkHocKy(id?: number, tenHocKy?: string, thoiGianBatDau?: Date, thoiGianKetThuc?: Date) {
    if (!tenHocKy || !thoiGianBatDau || !thoiGianKetThuc) {
      throw new BadRequestException('Thiếu dữ liệu học kỳ');
    }

    if(new Date(thoiGianBatDau) >= new Date(thoiGianKetThuc)){
        throw new BadRequestException('Thời gian kết thúc phải sau thời gian bắt đầu');
      }

      if(new Date(thoiGianBatDau) < new Date()){
        throw new BadRequestException('Thời gian bắt đầu phải là tương lai');
      }
      if(id !== undefined){
        console.log('check with id');
              const existByName = await this.hocKyRepository.findOne({
          where: { tenHocKy: tenHocKy.trim(), id: Not(id) },
        });
        if (existByName) {
          throw new BadRequestException('Tên học kỳ đã tồn tại');
        }
          const existByTime = await this.hocKyRepository.findOne({
          where: {
            thoiGianBatDau: LessThanOrEqual(thoiGianKetThuc),
            thoiGianKetThuc: MoreThanOrEqual(thoiGianBatDau),
            id: Not(id)
          },
        });
        if (existByTime) {
          throw new BadRequestException('Thời gian học kỳ bị trùng với học kỳ khác');
        }
      }else{
        const existByName = await this.hocKyRepository.findOne({
          where: { tenHocKy: tenHocKy.trim() },
        });
        if (existByName) {
          throw new BadRequestException('Tên học kỳ đã tồn tại');
        }
        const existByTime = await this.hocKyRepository.findOne({
          where: {
            thoiGianBatDau: LessThanOrEqual(thoiGianKetThuc),
            thoiGianKetThuc: MoreThanOrEqual(thoiGianBatDau),
          },
        });
        if (existByTime) {
          throw new BadRequestException('Thời gian học kỳ bị trùng với học kỳ khác');
        }
      }
  }
    
  async create(createHocKyDto: CreateHocKyDto) {
    const {tenHocKy, thoiGianBatDau, thoiGianKetThuc, phatHanh} = createHocKyDto;
    await this.checkHocKy(undefined, tenHocKy, thoiGianBatDau, thoiGianKetThuc);
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

  async findAll(tenHocKy: string) {
    try{
      if(tenHocKy){
        return await this.hocKyRepository.find({
          where:{
            tenHocKy: ILike(`%${tenHocKy}%`)
          },
          order:{
            phatHanh: "DESC",
            create_at: "DESC"
          }
        });
      }
      return await this.hocKyRepository.find({order:{phatHanh: "DESC", create_at: "DESC"}});
    }catch(error){
      console.log(error);
      throw new InternalServerErrorException('Lỗi lấy danh sách học kỳ');
    }
  }
  async findOne(id: number) {
    try{
      return await this.hocKyRepository.findOneBy({id});
    }catch(error){
      console.log(error);
      throw new InternalServerErrorException('Lỗi lấy học kỳ');
    }
  }

  async findAllHocKyDangDienRaVaTuongLai() {
    try{
      return await this.hocKyRepository.find({
        where:{
          thoiGianKetThuc: MoreThanOrEqual(new Date())
        }
      });
    }catch(error){
      console.log(error);
      throw new InternalServerErrorException('Lỗi lấy danh sách học kỳ phát hành');
    }
  }

  async update(id: number, updateHocKyDto: UpdateHocKyDto) {
    const hocKy = await this.hocKyRepository.findOneBy({id});
    if(!hocKy){
      throw new InternalServerErrorException('Học kỳ không tồn tại');
    }
    await this.checkHocKy(id,updateHocKyDto.tenHocKy, updateHocKyDto.thoiGianBatDau, updateHocKyDto.thoiGianKetThuc);
    try{
      return await this.hocKyRepository.update(id, updateHocKyDto);  
    }catch(error){
      console.log(error);
      throw new InternalServerErrorException('Lỗi cập nhật học kỳ');
    }
  }

  async remove(id: number) {
    try{
      const lopHoc = await this.lopHocPhanRepository.findOne({
        where:{idHocKy: id}
      });
      if(!lopHoc){
        throw new BadRequestException('Không thể xóa học kỳ này vì đã có lớp học phần liên kết');
      }
      return await this.hocKyRepository.delete(id);
    }catch(error){
      console.log(error);
      throw new InternalServerErrorException('Lỗi xóa học kỳ');
    }
  }
}

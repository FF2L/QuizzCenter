import { Chuong } from 'src/chuong/entities/chuong.entity';
import { GiangVienService } from './../giang-vien/giang-vien.service';
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateChuongDto } from './dto/create-chuong.dto';
import { UpdateChuongDto } from './dto/update-chuong.dto';
import { MonHocService } from 'src/mon-hoc/mon-hoc.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GiangVien } from 'src/giang-vien/entities/giang-vien.entity';
import { MonHoc } from 'src/mon-hoc/entities/mon-hoc.entity';
import { FindAllChuongDto } from './dto/findAll-chuong.dto';

@Injectable()
export class ChuongService {

  constructor( @InjectRepository(Chuong) private chuongRepo : Repository<Chuong>,
              private giangVienService: GiangVienService,
              private monHocService: MonHocService
  ) {}

  async taoMotChuong(createChuongDto: CreateChuongDto) {
    const giangVien = await this.giangVienService.timGiangVienTheoId(createChuongDto.idGiangVien)
    const monHoc = await this.monHocService.timMotMonHocTheoId(createChuongDto.idMonHoc)

      const chuong = this.chuongRepo.create({ //create là hàm tạo instance từ entity kiểm tra xem có đúng kiểu không trước khi import vào
      tenChuong: createChuongDto.tenChuong,
      thuTu: createChuongDto.thuTu,
      idGiangVien: createChuongDto.idGiangVien, 
      idMonHoc: createChuongDto.idMonHoc,  
    })

    try{
      return await this.chuongRepo.save(chuong)
    }catch (err) {
        // if (err.code === '23505') throw new BadRequestException('Thứ tự này đã tồn tại trong môn học'); // Postgres duplicate unique 
        
        throw new InternalServerErrorException('Không thể tạo chương');
    }
    
  }

  async timTatCaChuongTheoIdMonHoc(idMonHoc: number) {
      const monHoc = await this.monHocService.timMotMonHocTheoId(idMonHoc)

      try{
        return await this.chuongRepo.find({
          where: {idMonHoc: idMonHoc}, 
          order: {thuTu: 'ASC'} //thứ tự tăng dần
        })
      }catch(err){
        throw new InternalServerErrorException('Tìm tất cả chương theo môn học không thành công')
      }
  }

  findOne(id: number) {
    return `This action returns a #${id} chuong`;
  }

  async capNhatChuong(id: number, updateChuongDto: UpdateChuongDto) {
    //preload nghĩa là nó sẽ tìm ở dưới database xem đã có chưa chưa có thì trả về undefine có rồi thì thay thế trường cần thay thế vào
    //sau khi dùng preload nếu dùng repo.save thì type orm hiểu đây là một cái cần update thì nó sẽ chạy hook before update trong entity
    //và cuối cùng nếu preload thành công mình sẽ có một instance của chương nó sẽ kiểm tra validate trong entity nếu trường nào sai nó sẽ lỗi
    
    const chuong = await this.chuongRepo.preload({id, ...updateChuongDto}) 
    if(!chuong) throw new NotFoundException(`Không tìm thấy chương với id: ${id}`)

      try{
        return await this.chuongRepo.save(chuong)
      }catch(err){
        throw new InternalServerErrorException('Cập nhật chương không thành công')
      }
     
  }

  remove(id: number) {
    return `This action removes a #${id} chuong`;
  }
}

import { Chuong } from 'src/chuong/entities/chuong.entity';
import { GiangVienService } from './../giang-vien/giang-vien.service';
import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateChuongDto } from './dto/create-chuong.dto';
import { UpdateChuongDto } from './dto/update-chuong.dto';
import { MonHocService } from 'src/mon-hoc/mon-hoc.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GiangVien } from 'src/giang-vien/entities/giang-vien.entity';
import { MonHoc } from 'src/mon-hoc/entities/mon-hoc.entity';
import { FindAllChuongDto } from './dto/findAll-chuong.dto';
import { Pagination } from 'src/common/dto/pagination.dto';
import { CauHoiService } from 'src/cau-hoi/cau-hoi.service';
import { FilterCauHoiQueryDto } from 'src/cau-hoi/dto/filter_cau-hoi_query.dto';

@Injectable()
export class ChuongService {

  constructor( @InjectRepository(Chuong) private chuongRepo : Repository<Chuong>,
              private giangVienService: GiangVienService,
              private monHocService: MonHocService,
              @Inject(forwardRef(() => CauHoiService)) private cauHoiService: CauHoiService
  ) {}



  async taoMotChuong (createChuongDto: CreateChuongDto,id:number){
    const giangVien = await this.giangVienService.timGiangVienTheoId(id)
    const monHoc = await this.monHocService.timMotMonHocTheoId(createChuongDto.idMonHoc)

    const chuong = this.chuongRepo.create({ //create là hàm tạo instance từ entity kiểm tra xem có đúng kiểu không trước khi import vào
      tenChuong: createChuongDto.tenChuong,
      idGiangVien: id, 
      idMonHoc: createChuongDto.idMonHoc,  
    })

    try{
      return await this.chuongRepo.save(chuong)
    }catch (err) {
        // if (err.code === '23505') throw new BadRequestException('Thứ tự này đã tồn tại trong môn học'); // Postgres duplicate unique 
        
        throw new InternalServerErrorException('Không thể tạo chương');
    }

  }


async layTatCaChuongTheoMonHocVaNguoiDung(idMonHoc: number, idNguoiDung: number) {
  const qb = this.chuongRepo.createQueryBuilder('c')
              .innerJoin('c.giangVien', 'gv')
              .innerJoin('gv.nguoiDung', 'nd')
              .where('c.idMonHoc = :idMonHoc', { idMonHoc })
              .andWhere('nd.id = :idNguoiDung', { idNguoiDung })
              .orderBy('c.create_at', 'ASC') // Sắp xếp theo thứ tự tạo
              
  const chuong = await qb.getMany();
  
  return chuong;
}

  async timMotChuongTheoId(id: number) {
    const chuong= await this.chuongRepo.findOne({
      where: {id}
    })
    if (!chuong) throw new NotFoundException('Không tìm thấy chương')
      return chuong
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

  async layTatCauHoiTheoChuong(idChuong: number, query: any){
    const { skip, limit, doKho, sortdoKho, noiDungCauHoi } = query;
    const chuong = await this.timMotChuongTheoId(idChuong)

    return await this.cauHoiService.layTatCaCauHoiTheoIdChuong(idChuong,{ skip, limit, doKho, noiDungCauHoi })

  }

  async xoaChuongTheoIdChuong(id: number) {
    const chuong = await this.timMotChuongTheoId(id)
    if(+chuong.soLuongCauHoi>0)
      throw new BadRequestException('Không thể xóa chương có câu hỏi')
    else
      return await this.chuongRepo.delete(id);
  } 
}

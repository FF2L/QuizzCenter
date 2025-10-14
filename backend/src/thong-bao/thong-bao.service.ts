import { FindAllChuongDto } from './../chuong/dto/findAll-chuong.dto';
import { Injectable } from '@nestjs/common';
import { CreateThongBaoDto } from './dto/create-thong-bao.dto';
import { UpdateThongBaoDto } from './dto/update-thong-bao.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ThongBao } from './entities/thong-bao.entity';
import { Repository } from 'typeorm';
import { ThongBaoNguoiDung } from './entities/thong-bao_nguoi-dung.entity';
import { Pagination } from 'src/common/dto/pagination.dto';
import { DEFAULT_PAGE_LIMIT } from 'src/common/utiils/const.globals';

@Injectable()
export class ThongBaoService {
  constructor(@InjectRepository(ThongBao)private thongBaoRepo: Repository<ThongBao>,
  @InjectRepository(ThongBaoNguoiDung)private thongBaoNguoiDungRepo: Repository<ThongBaoNguoiDung>,
){}
  create(createThongBaoDto: CreateThongBaoDto) {
    return 'This action adds a new thongBao';
  }

  async layTatCaThongBaoCuaNguoiDung(id: number, pageDto: Pagination) {
   const qb = this.thongBaoNguoiDungRepo
    .createQueryBuilder('tbn')
    .innerJoinAndSelect('tbn.thongBao', 'tb') // lấy nội dung thông báo
    .where('tbn.idNguoiDung = :id', { id })
    .orderBy('tb.create_at', 'DESC')          // hoặc 'tbn.id' nếu không có createdAt
    .skip(pageDto.skip ?? 0)
    .take(pageDto.limit ?? DEFAULT_PAGE_LIMIT)

    const rows = await qb.getMany()
    
    const items = rows.map( (r) => ({
    tbnId: r.id,
    daDoc: r.daDoc,
    // nếu ThongBao là lazy, cần await:
    noiDung: ((r as any).__thongBao__).noiDung,      // đã join nên có ngay
    createdAt: ((r as any).__thongBao__).create_at // đã select ở join nên có sẵn
  }));

   return items
  }

  update(id: number, updateThongBaoDto: UpdateThongBaoDto) {
    return `This action updates a #${id} thongBao`;
  }

  remove(id: number) {
    return `This action removes a #${id} thongBao`;
  }
}

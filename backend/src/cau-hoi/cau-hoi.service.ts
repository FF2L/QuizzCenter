import { log } from 'console';
import { forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCauHoiDto } from './dto/create-cau-hoi.dto';
import { UpdateCauHoiDto } from './dto/update-cau-hoi.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { CauHoi } from './entities/cau-hoi.entity';
import { DataSource, Repository } from 'typeorm';
import { ChuongService } from 'src/chuong/chuong.service';
import { Pagination } from 'src/common/dto/pagination.dto';
import { DEFAULT_PAGE_LIMIT } from 'src/common/utiils/const.globals';
import { FilterCauHoiQueryDto } from './dto/filter_cau-hoi_query.dto';
import { DapAnService } from 'src/dap-an/dap-an.service';
import { DapAn } from 'src/dap-an/entities/dap-an.entity';

@Injectable()
export class CauHoiService {
  constructor(@InjectRepository(CauHoi) private cauHoiRepo: Repository<CauHoi>,
              @InjectDataSource() private readonly ds: DataSource,
              @Inject(forwardRef(() => ChuongService))private chuongService : ChuongService,
              @Inject(forwardRef(() => DapAnService))private dapAnService : DapAnService
){}

  async taoMotCauHoi(createCauHoiDto: CreateCauHoiDto) {
    const chuong = await this.chuongService.timMotChuongTheoId(createCauHoiDto.idChuong)
    
    return this.ds.transaction(async (manager) =>{
      const cauHoi = await manager.save(manager.create(CauHoi,{
      tenHienThi: createCauHoiDto.tenHienThi,
      noiDungCauHoi: createCauHoiDto.noiDungCauHoi,
      loaiCauHoi: createCauHoiDto.loaiCauHoi,
      doKho: createCauHoiDto.doKho,
      idChuong: createCauHoiDto.idChuong
    }));

    
    const mangDapAn = await this.dapAnService.taoNhieuDapAn(createCauHoiDto.mangDapAn, cauHoi.id, cauHoi.loaiCauHoi, manager)
    return {cauHoi,mangDapAn}
    })
    
  }

  findAll() {
    return `This action returns all cauHoi`;
  }

  async layTatCaCauHoiTheoIdChuong(idChuong:number, filterCauHoiDto: FilterCauHoiQueryDto){
   
    const qb = this.cauHoiRepo.createQueryBuilder('qh')
    .where('qh.idChuong = :idChuong', { idChuong });

    if (filterCauHoiDto.doKho !== undefined) qb.andWhere('qh.doKho = :doKho', { doKho: filterCauHoiDto.doKho });
    if (filterCauHoiDto.loaiCauHoi !== undefined) qb.andWhere('qh.loaiCauHoi = :loai', { loai: filterCauHoiDto.loaiCauHoi });

    return qb.orderBy('qh.update_at', 'ASC')
      .skip(filterCauHoiDto.skip)
      .take(filterCauHoiDto.limit ?? DEFAULT_PAGE_LIMIT)
      .getMany();

  }

 async timCauHoiTheoId(id: number) {
    const cauHoi = await this.cauHoiRepo.findOne({ where: { id } });
    console.log(id)
    if (!cauHoi) throw new NotFoundException('Không tìm thấy câu hỏi');
    await cauHoi.dapAn;           
    return {cauHoi}
  }

  async capNhatCauHoi(id: number, updateCauHoiDto: UpdateCauHoiDto) {
    const cauHoi = await this.cauHoiRepo.preload({id,...updateCauHoiDto})

    if(!cauHoi) throw new NotFoundException('Không tìm thấy câu hỏi cần update')
    
    try{
      return await this.cauHoiRepo.save(cauHoi)
    }catch(err){
      throw new InternalServerErrorException('Cập nhật câu hỏi không thảnh công')
    }
  }

  async remove(id: number) {
    return await this.cauHoiRepo.delete(id)
  }
}

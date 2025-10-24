import { log } from 'console';
import { forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCauHoiDto } from './dto/create-cau-hoi.dto';
import { UpdateCauHoiDto } from './dto/update-cau-hoi.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { CauHoi } from './entities/cau-hoi.entity';
import { DataSource, In, Repository } from 'typeorm';
import { ChuongService } from 'src/chuong/chuong.service';
import { Pagination } from 'src/common/dto/pagination.dto';
import { DEFAULT_PAGE_LIMIT } from 'src/common/utiils/const.globals';
import { DapAnService } from 'src/dap-an/dap-an.service';
import { GuiFileService } from 'src/gui-file/gui-file.service';

@Injectable()
export class CauHoiService {
  constructor(@InjectRepository(CauHoi) private cauHoiRepo: Repository<CauHoi>,
              @InjectDataSource() private readonly ds: DataSource,
              @Inject(forwardRef(() => ChuongService))private chuongService : ChuongService,
              @Inject(forwardRef(() => DapAnService))private dapAnService : DapAnService,
              private readonly dataSource: DataSource,
              private guiFileService: GuiFileService
){}

  async taoMotCauHoi(createCauHoiDto: CreateCauHoiDto) {
    const chuong = await this.chuongService.timMotChuongTheoId(createCauHoiDto.idChuong)
    
    
      const cauHoi = this.cauHoiRepo.create({
      tenHienThi: createCauHoiDto.tenHienThi,
      noiDungCauHoi: createCauHoiDto.noiDungCauHoi,
      noiDungCauHoiHTML: createCauHoiDto.noiDungCauHoiHTML,
      loaiCauHoi: createCauHoiDto.loaiCauHoi,
      doKho: createCauHoiDto.doKho,
      idChuong: createCauHoiDto.idChuong
      })
      try{
        const cauHoiSave = await this.cauHoiRepo.save(cauHoi)
        const mangDapAn = await this.dapAnService.taoNhieuDapAn(createCauHoiDto.mangDapAn, cauHoiSave.id, cauHoi.loaiCauHoi)
        return {cauHoi,mangDapAn}
      }catch (error) {
        console.error(error);
        throw new InternalServerErrorException('Lỗi khi tạo câu hỏi');
      }
  }

  async taoDanhSachCauHoi(idChuong: number, createCauHoiDto: CreateCauHoiDto[]) {
    const chuong = await this.chuongService.timMotChuongTheoId(idChuong)
    const cauHoiEntities: CauHoi[] = [];
    const allDapAn: any[] = []
    for (const dto of createCauHoiDto) {
      const cauHoi = this.cauHoiRepo.create({
        tenHienThi: dto.tenHienThi,
        noiDungCauHoi: dto.noiDungCauHoi,
        noiDungCauHoiHTML: dto.noiDungCauHoiHTML,
        loaiCauHoi: dto.loaiCauHoi,
        doKho: dto.doKho,
        idChuong: idChuong
      });
      cauHoiEntities.push(cauHoi);
    }
    try {
      const cauHoiSaveArray = await this.cauHoiRepo.save(cauHoiEntities);
      for (let i = 0; i < cauHoiSaveArray.length; i++) {
        const dto = createCauHoiDto[i];
        const cauHoiSave = cauHoiSaveArray[i];
        const mangDapAn = await this.dapAnService.taoNhieuDapAn(dto.mangDapAn, cauHoiSave.id, cauHoiSave.loaiCauHoi);
        allDapAn.push(...mangDapAn);
      }
      return { cauHoi: cauHoiSaveArray, mangDapAn: allDapAn };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Lỗi khi tạo danh sách câu hỏi');
    }
  }


async layTatCaCauHoiTheoIdChuong(idChuong:number, query:any){
  const { skip, limit, doKho, noiDungCauHoi } = query;
 
  const qb = this.cauHoiRepo.createQueryBuilder('qh')
  .where('qh.idChuong = :idChuong', { idChuong });

  if (doKho !== undefined) {
    qb.andWhere('qh.doKho = :doKho', { doKho });
  }

  if (noiDungCauHoi) {
    qb.andWhere('unaccent(qh.noiDungCauHoi) ILIKE unaccent(:noiDungCauHoi)', { noiDungCauHoi: `%${noiDungCauHoi}%` });
  }


  qb.addOrderBy('qh.create_at', 'ASC');

  const [data, total] = await qb
    .skip(skip ?? 0)
    .take(limit ?? DEFAULT_PAGE_LIMIT)
    .getManyAndCount();
    console.log("Fetched questions:", data);

  return {
    data,
    total,
    currentPage: Math.floor((skip ?? 0) / (limit ?? DEFAULT_PAGE_LIMIT)) + 1,
    totalPages: Math.ceil(total / (limit ?? DEFAULT_PAGE_LIMIT))
  };
}

 async timCauHoiTheoId(id: number) {
    const cauHoi = await this.cauHoiRepo.findOne({ where: { id } });
    if (!cauHoi) throw new NotFoundException('Không tìm thấy câu hỏi');
    const dapAn = await this.dapAnService.timNhieuDapAnTheoIdCauHoi(id)       
    return {cauHoi, dapAn}
  }

async timMangCauHoiTheoMangIdCauHoi(ids: number[]){
  try{
    return await this.cauHoiRepo.find({
      where: { id: In(ids) }
    })
  }catch(error){ 
    throw new InternalServerErrorException('Lỗi khi tìm mảng câu hỏi theo Id câu hỏi')
  }
}

 async capNhatCauHoi(id: number, updateCauHoiDto: UpdateCauHoiDto) {
 
   const cauHoiPreLoad = await this.cauHoiRepo.preload({ id, ...updateCauHoiDto });
   if (!cauHoiPreLoad) throw new NotFoundException('Không tìm thấy câu hỏi cần cập nhật');
   try{
      return await this.cauHoiRepo.save(cauHoiPreLoad);
   }catch(err){
    throw new InternalServerErrorException('Lỗi cập nhật câu hỏi')
   }
   
 }

 async remove(id: number) {
    const cauHoi =  await this.timCauHoiTheoId(id);
  
    try{
       await this.cauHoiRepo.softDelete(id);
       return{message: 'oke'}
    }catch(err){
      throw new InternalServerErrorException('Lỗi xóa câu hỏi')
    }
 }


}

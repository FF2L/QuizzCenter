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
import { ImgFile } from 'src/common/utiils/types.globals';
import { FileDinhKemService } from 'src/file-dinh-kem/file-dinh-kem.service';
import { FileDinhKem } from 'src/file-dinh-kem/entities/file-dinh-kem.entity';
import { GuiFile } from 'src/gui-file/entities/gui-file.entity';
import { GuiFileService } from 'src/gui-file/gui-file.service';

@Injectable()
export class CauHoiService {
  constructor(@InjectRepository(CauHoi) private cauHoiRepo: Repository<CauHoi>,
              @InjectDataSource() private readonly ds: DataSource,
              @Inject(forwardRef(() => ChuongService))private chuongService : ChuongService,
              @Inject(forwardRef(() => DapAnService))private dapAnService : DapAnService,
              @Inject(forwardRef(() => FileDinhKemService)) private fileDinhKemService: FileDinhKemService,
              private readonly dataSource: DataSource,
              private guiFileService: GuiFileService
){}

  async taoMotCauHoi(createCauHoiDto: CreateCauHoiDto, mangFile?: ImgFile[]) {
    const chuong = await this.chuongService.timMotChuongTheoId(createCauHoiDto.idChuong)
    
    
      const cauHoi = this.cauHoiRepo.create({
      tenHienThi: createCauHoiDto.tenHienThi,
      noiDungCauHoi: createCauHoiDto.noiDungCauHoi,
      noiDungCauHoiHTML: createCauHoiDto.noiDungCauHoiHTML,
      loaiCauHoi: createCauHoiDto.loaiCauHoi,
      doKho: createCauHoiDto.doKho,
      idChuong: createCauHoiDto.idChuong
      })
      const cauHoiSave = await this.cauHoiRepo.save(cauHoi)

    
    const mangDapAn = await this.dapAnService.taoNhieuDapAn(createCauHoiDto.mangDapAn, cauHoiSave.id, cauHoi.loaiCauHoi)

    const mangFileDinhKemSave: FileDinhKem[] = await this.luuMangFileDinhKemVaTraVe(cauHoiSave.id,mangFile)

    return {cauHoi,mangDapAn,mangFileDinhKemSave}
  
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
    if (!cauHoi) throw new NotFoundException('Không tìm thấy câu hỏi');
    const dapAn = await this.dapAnService.timNhieuDapAnTheoIdCauHoi(id)
    const mangFileDinhKem = await this.fileDinhKemService.timTatCaFileDinhKemTheoIdCauHoi(id)           
    return {cauHoi, dapAn, mangFileDinhKem}
  }

  async capNhatCauHoi(id: number, updateCauHoiDto: UpdateCauHoiDto, mangFile?: ImgFile[]) {
    const {mangAnhPublicId, ...truongCauHoiCanUpdate} = updateCauHoiDto
    const cauHoi = await this.cauHoiRepo.preload({id,...truongCauHoiCanUpdate})

    if(!cauHoi) throw new NotFoundException('Không tìm thấy câu hỏi cần update')
    if(mangAnhPublicId) {
      const mangFIleDinhKemCuaCauHoi = await this.fileDinhKemService.timTatCaFileDinhKemTheoIdCauHoi(id)
      const setMangAnhPublicId = new Set(mangAnhPublicId)
      const mangFileDinhKemDaMat = mangFIleDinhKemCuaCauHoi.filter(pub => !setMangAnhPublicId.has(pub.publicId))
      const mangIdsPublicCanXoa = mangFileDinhKemDaMat.map(a => (a.publicId))

      await this.fileDinhKemService.xoaAnhTheoIdPublic(mangIdsPublicCanXoa,id)
        
    }
    
    try{
      await this.luuMangFileDinhKemVaTraVe(id,mangFile)
     
      return await this.cauHoiRepo.save(cauHoi)
    }catch(err){
      throw new InternalServerErrorException('Cập nhật câu hỏi không thảnh công')
    }
  }



  async remove(id: number) {
    return await this.dataSource.transaction(async(manager) =>{
      const dapAnRepo = manager.getRepository(DapAn)
      const fileDinhKemRepo = manager.getRepository(FileDinhKem)
      const cauHoiRepoTRans = manager.getRepository(CauHoi);
    

      
      const publicId = await fileDinhKemRepo.find({where: {idCauHoi: id}, select: {publicId:true}})
      for( var a of publicId){
        await this.guiFileService.xoaAnhTheoId(a.publicId)
      }
      await dapAnRepo.delete({idCauHoi: id})
      await fileDinhKemRepo.delete({idCauHoi: id})
      await cauHoiRepoTRans.delete(id)
    })
  }

    async luuMangFileDinhKemVaTraVe( idCauHoi:number, mangFile?:ImgFile[], ){
      let buffers:Buffer[] = []
      let mangTenFile:string[] = []
      
      if(mangFile) {
        mangFile.forEach(f => {buffers.push(f.buffer); mangTenFile.push(f.originalname)})
        return  await this.fileDinhKemService.taoMangFileImgDinhKem(buffers,mangTenFile,idCauHoi)
      }
      return []
  }
}

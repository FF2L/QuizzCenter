import { CauHoi } from 'src/cau-hoi/entities/cau-hoi.entity';
import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateDapAnDto, DapAnDto } from './dto/create-dap-an.dto';
import { UpdateDapAnDto } from './dto/update-dap-an.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DapAn } from './entities/dap-an.entity';
import { EntityManager, Repository } from 'typeorm';
import { CauHoiService } from 'src/cau-hoi/cau-hoi.service';
import { LoaiCauHoi } from 'src/common/enum/loaicauhoi.enum';
import { CreateMotDapAn } from './dto/create-mot-dap-an.dto';
import { NotFoundError } from 'rxjs';

@Injectable()
export class DapAnService {
  constructor(@InjectRepository(DapAn) private dapAnRepo: Repository<DapAn>,
    @Inject(forwardRef(()=> CauHoiService)) private cauHoiService: CauHoiService
){}

  async taoNhieuDapAn(mangDapAn: DapAnDto[], idCauHoi: number, loaiCauHoi: LoaiCauHoi, manager?: EntityManager) {
    
    const mangDapAnDaCoIdCauHoi = mangDapAn.map((dapAn) => ({...dapAn,idCauHoi}))
    let soDapAnDung = 0
    mangDapAn.forEach((dapAn) => soDapAnDung += dapAn.dapAnDung ? 1 : 0 )
    if(soDapAnDung ===0) throw new BadRequestException('Câu hỏi phải có ít nhất một câu trả lời đúng')
    if(loaiCauHoi === LoaiCauHoi.MotDung && soDapAnDung >1)
      throw new BadRequestException('Câu hỏi một đúng chỉ có một đáp án đúng, sai nếu có 0 hoặc nhiều hơn 1 đáp án đúng')

    const dapAnManager = manager ? manager.getRepository(DapAn) : this.dapAnRepo

    return await dapAnManager.save(mangDapAnDaCoIdCauHoi)
    
  }

  async taoMotDapAn(createMotDapAn: CreateMotDapAn){
    const cauHoi = await this.cauHoiService.timCauHoiTheoId(createMotDapAn.idCauHoi)

    const dapAn = this.dapAnRepo.create({
      noiDung: createMotDapAn.noiDung,
      dapAnDung: createMotDapAn.dapAnDung,
      idCauHoi: createMotDapAn.idCauHoi
  })
      try{
        return await this.dapAnRepo.save(dapAn)
      }catch (err) {
          
          throw new InternalServerErrorException('Không thể tạo một đáp án');
      }
  }

  findAll() {
    return `This action returns all dapAn`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dapAn`;
  }

async capNhatMotDapAn(id: number, dto: UpdateDapAnDto, manager?: EntityManager) {
  const repo = manager ? manager.getRepository(DapAn) : this.dapAnRepo;

  // preload trả về Promise<DapAn | null>
  const entity = await repo.preload({ id, ...dto });
  if (!entity) throw new NotFoundException('Không tìm thấy đáp án');

 ;
   try{
       return await repo.save(entity)
     }catch(err){
      throw new InternalServerErrorException('Lỗi sửa một đáp án')
     }
}


  async xoaMotDApAnTheoIdDapAn(id: number) {
     const cauHoi = await this.cauHoiService.timCauHoiTheoId(id)
     const dapAn = await this.dapAnRepo.findOne({where: {id}})
     if(dapAn?.dapAnDung === true && cauHoi.cauHoi.loaiCauHoi === LoaiCauHoi.MotDung)
       throw new BadRequestException('Không thể xóa đáp án đúng của câu hỏi một đúng cần phải thêm câu hỏi đúng thay thế vào')
     try{
      return await this.dapAnRepo.delete(id);
     }catch(err){
      throw new InternalServerErrorException('Lỗi xóa một đáp án')
     }
    
  }
}

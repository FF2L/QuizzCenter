import { map } from 'rxjs';
import { forwardRef, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateFileDinhKemDto } from './dto/create-file-dinh-kem.dto';
import { UpdateFileDinhKemDto } from './dto/update-file-dinh-kem.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FileDinhKem } from './entities/file-dinh-kem.entity';
import { In, Not, Repository } from 'typeorm';
import { CauHoiService } from 'src/cau-hoi/cau-hoi.service';
import { GuiFileService } from 'src/gui-file/gui-file.service';
import { UploadApiOptions } from 'cloudinary';

@Injectable()
export class FileDinhKemService {
  constructor(@InjectRepository(FileDinhKem) private fileDinhKemRepo : Repository<FileDinhKem>,
              @Inject(forwardRef(()=>CauHoiService))private cauHoiService: CauHoiService,
              private guiFileService: GuiFileService
){}

  async taoMangFileImgDinhKem(buffers: Buffer[], mangTenFile: string[],idCauHoi: number, options: UploadApiOptions = {}){
  
  const uploaded = await this.guiFileService.uploadMangAnh(buffers,options)

  const mangFileDinhKem = uploaded.map((u, i) =>
    this.fileDinhKemRepo.create({
      idCauHoi,
      duongDan: u.url,
      publicId: u.public_id,
      loaiFile: u.format,
      tenFile: mangTenFile[i],
    })
  );
    try{ 
      return await this.fileDinhKemRepo.save(mangFileDinhKem)
    }catch(err){
      throw new InternalServerErrorException('Lỗi không thể lưu url vào subabase')
    }
  }
  create(createFileDinhKemDto: CreateFileDinhKemDto) {
    return 'This action adds a new fileDinhKem';
  }


  async timTatCaFileDinhKemTheoIdCauHoi(idCauHoi: number) {
    return await this.fileDinhKemRepo.find({where: {idCauHoi}})
  }

  update(id: number, updateFileDinhKemDto: UpdateFileDinhKemDto) {
    return `This action updates a #${id} fileDinhKem`;
  }

  async xoaAnhTheoIdPublic(idsCanBo: string[],idCauHoi: number) {
      for(var a of idsCanBo){
        await this.guiFileService.xoaAnhTheoId(a)
      }
      try{
          return await this.fileDinhKemRepo.delete({
            idCauHoi,
            publicId: In(idsCanBo),     
          });
      }catch(error){
        throw new InternalServerErrorException('Lỗi xóa file đính kèm trên subabase')
      }

  }
}

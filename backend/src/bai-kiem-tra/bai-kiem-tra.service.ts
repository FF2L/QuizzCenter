import { BaiKiemTra } from 'src/bai-kiem-tra/entities/bai-kiem-tra.entity';
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateBaiKiemTraDto } from './dto/create-bai-kiem-tra.dto';
import { UpdateBaiKiemTraDto } from './dto/update-bai-kiem-tra.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LopHocPhanService } from 'src/lop-hoc-phan/lop-hoc-phan.service';
import { LoaiKiemTra } from 'src/common/enum/loaiKiemTra.enum';

@Injectable()
export class BaiKiemTraService {

  constructor(@InjectRepository(BaiKiemTra) private baiKiemTraRepo : Repository<BaiKiemTra>,
              private lopHocPhanService: LopHocPhanService
){}
  async taoBaiKiemTra(createBaiKiemTraDto: CreateBaiKiemTraDto) {
    await this.lopHocPhanService.timMotLopHocPhanTheoId(createBaiKiemTraDto.idLopHocPhan)
    if(createBaiKiemTraDto.loaiKiemTra === LoaiKiemTra.BaiKiemTra && +createBaiKiemTraDto.soLanLam >1){
      throw new BadRequestException('Nếu loại kiểm tra là bài kiểm tra thì số lần làm phải bằng 1')
    }
    const baiKiemTra = this.baiKiemTraRepo.create({
      tenBaiKiemTra: createBaiKiemTraDto.tenBaiKiemTra,
      loaiKiemTra: createBaiKiemTraDto.loaiKiemTra,
      soLanLam: createBaiKiemTraDto.soLanLam,
      xemBaiLam: createBaiKiemTraDto.xemBaiLam,
      hienThiKetQua: createBaiKiemTraDto.hienThiKetQua,
      thoiGianBatDau: createBaiKiemTraDto.thoiGianBatDau,
      thoiGianKetThuc: createBaiKiemTraDto.thoiGianKetThuc,
      thoiGianLam: createBaiKiemTraDto.thoiGianLam,
      idLopHocPhan: createBaiKiemTraDto.idLopHocPhan
    })
    try{
          return await this.baiKiemTraRepo.save(baiKiemTra)
    }catch(error){
      throw new InternalServerErrorException('Lỗi khi tạo bài kiểm tra')
    }

  }

  async timTatCaBaiKiemTraTheoIdLopHocPhan(idLopHocPhan: number) {
    await this.lopHocPhanService.timMotLopHocPhanTheoId(idLopHocPhan)
    return await this.baiKiemTraRepo.find({where: {idLopHocPhan}, order: {update_at: 'DESC'}})
  }

  async timMotBaiKiemTraTheoIdBaiKiemTra(idBaiKiemTra: number){
    const baiKiemTra = await this.baiKiemTraRepo.findOne({where: {id: idBaiKiemTra}})
    if(!baiKiemTra) throw new NotFoundException(`Không tìm thấy bài kiểm tra ${idBaiKiemTra}`)
    return baiKiemTra
  }

  async capNhatBaiKiemTra(idBaiKiemTra: number, updateBaiKiemTraDto: UpdateBaiKiemTraDto) {
    await this.timMotBaiKiemTraTheoIdBaiKiemTra(idBaiKiemTra)

    const entity = await this.baiKiemTraRepo.findOneByOrFail({ id: idBaiKiemTra });

      // Lấy giá trị cuối cùng sẽ lưu (DTO ghi đè, nếu không có thì giữ nguyên)
    const loaiCuoi = updateBaiKiemTraDto.loaiKiemTra ?? entity.loaiKiemTra;
  const soLanCuoi = updateBaiKiemTraDto.soLanLam ?? entity.soLanLam;

  // Ràng buộc nghiệp vụ
  if (loaiCuoi === LoaiKiemTra.BaiKiemTra && soLanCuoi !== 1) {
    throw new BadRequestException(
      'Nếu loại kiểm tra là Bài kiểm tra thì số lần làm phải bằng 1',
    );
  }
    try{
      // Lưu
  Object.assign(entity, updateBaiKiemTraDto);
  return this.baiKiemTraRepo.save(entity);

    }catch(err){
      throw new InternalServerErrorException('Cập nhật chương không thành công')
    }
  }

  async xoaBaiKiemTRaTheoIdBaiKiemTRa(idBaiKiemTra: number) {

    await this.timMotBaiKiemTraTheoIdBaiKiemTra(idBaiKiemTra)

    try{
      return await this.baiKiemTraRepo.delete(idBaiKiemTra)
    }catch(err){
      throw new InternalServerErrorException('Cập nhật chương không thành công')
    }

  }
}

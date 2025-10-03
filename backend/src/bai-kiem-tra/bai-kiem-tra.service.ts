import { BaiKiemTra } from 'src/bai-kiem-tra/entities/bai-kiem-tra.entity';
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateBaiKiemTraDto } from './dto/create-bai-kiem-tra.dto';
import { UpdateBaiKiemTraDto } from './dto/update-bai-kiem-tra.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { LopHocPhanService } from 'src/lop-hoc-phan/lop-hoc-phan.service';
import { LoaiKiemTra } from 'src/common/enum/loaiKiemTra.enum';
import { Pagination } from 'src/common/dto/pagination.dto';
import { ChiTietCauHoiBaiKiemTra } from './entities/chi-tiet-cau-hoi-bai-kiem-tra';
import { CreateChiTietBaiKiemTraDto } from './dto/create-chi-tiet-bai-kiem-tra.dto';
import { CauHoiService } from 'src/cau-hoi/cau-hoi.service';

@Injectable()
export class BaiKiemTraService {

  constructor(@InjectRepository(BaiKiemTra) private baiKiemTraRepo : Repository<BaiKiemTra>,
              @InjectRepository(ChiTietCauHoiBaiKiemTra) private chiTietCauHoiBaiKiemTraRepo : Repository<ChiTietCauHoiBaiKiemTra>,
              private lopHocPhanService: LopHocPhanService,
              private cauHoiService :CauHoiService
){}
  /**CRUD bài kiểm tra */
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
    const baiKiemTra = await this.baiKiemTraRepo.findOne({where: {id: idBaiKiemTra}},)
    if(!baiKiemTra) throw new NotFoundException(`Không tìm thấy bài kiểm tra ${idBaiKiemTra}`)

    return baiKiemTra.chiTietCauHoiBaiKiemTra
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


  /**CRUD câu hỏi trong bài kiểm tra */
  async layTatCaCauHoiCoTrongBaiKiemTraTheoIdBaiKiemTra(idBaiKiemTra: number, pagination: Pagination){
    await this.timMotBaiKiemTraTheoIdBaiKiemTra(idBaiKiemTra)
      return await this.chiTietCauHoiBaiKiemTraRepo.find({where: {idBaiKiemTra}, 
        relations: [
          'cauHoi',                       
        ],
         skip: pagination.skip,
         take: pagination.limit,
        order: {update_at: 'DESC'}
        })
  }

  async themMangCauHoiVaoTrongBaiKiemTra(createChiTietDto: CreateChiTietBaiKiemTraDto ){
    const { idBaiKiemTra, mangIdCauHoi } = createChiTietDto;

    await this.timMotBaiKiemTraTheoIdBaiKiemTra(idBaiKiemTra)

    const danhSachChiTietBaiKiemTra = mangIdCauHoi.map(id => ({idCauHoi: id, idBaiKiemTra: idBaiKiemTra}))

    // Làm sạch & loại trùng trong input
    const ids = Array.from(new Set(mangIdCauHoi)).filter((x) => Number.isInteger(x));
    if (ids.length === 0) throw new BadRequestException('mangIdCauHoi không được dể trống ');

    // kiểm tra id không tồn tại
    const cauHoiList = await this.cauHoiService.timMangCauHoiTheoMangIdCauHoi(mangIdCauHoi)
    const foundIds = new Set(cauHoiList.map((c) => c.id));
    const notFound = ids.filter((id) => !foundIds.has(id));
    if (notFound.length) {
      throw new BadRequestException(`Các idCauHoi không tồn tại: [${notFound.join(', ')}]`);
    }

    // chặn trùng đã có trong bài kiểm tra
    const existed = await this.chiTietCauHoiBaiKiemTraRepo.find({
        where: { idBaiKiemTra, idCauHoi: In(ids) },
        select: { idCauHoi: true },
      });
      if (existed.length) {
        const existedIds = existed.map((e) => e.idCauHoi);
        throw new BadRequestException(
          `Các idCauHoi đã có trong bài kiểm tra: [${existedIds.join(', ')}]`
        );
      }
    try{
      return await this.chiTietCauHoiBaiKiemTraRepo.save(danhSachChiTietBaiKiemTra)
    }catch(error){
      throw new InternalServerErrorException('Lỗi khi thêm mảng id câu hỏi vào trong bài kiểm tra')
    }
  }

  async capNhatMangCauHoiCoTrongBaiKiemTra(createChiTietDto: CreateChiTietBaiKiemTraDto){
    const { idBaiKiemTra, mangIdCauHoi } = createChiTietDto;

    await this.timMotBaiKiemTraTheoIdBaiKiemTra(idBaiKiemTra)

    const danhSachChiTietBaiKiemTra = mangIdCauHoi.map(id => ({idCauHoi: id, idBaiKiemTra: idBaiKiemTra}))
    
    if(!mangIdCauHoi){
      
    }

    // Làm sạch & loại trùng trong input
    const ids = Array.from(new Set(mangIdCauHoi)).filter((x) => Number.isInteger(x));
    if (ids.length === 0) throw new BadRequestException('mangIdCauHoi không được dể trống ');

    // kiểm tra id không tồn tại
    const cauHoiList = await this.cauHoiService.timMangCauHoiTheoMangIdCauHoi(mangIdCauHoi)
    const foundIds = new Set(cauHoiList.map((c) => c.id));
    const notFound = ids.filter((id) => !foundIds.has(id));
    if (notFound.length) {
      throw new BadRequestException(`Các idCauHoi không tồn tại: [${notFound.join(', ')}]`);
    }

    try{
      return await this.chiTietCauHoiBaiKiemTraRepo.save(danhSachChiTietBaiKiemTra)
    }catch(error){
      throw new InternalServerErrorException('Lỗi khi thêm mảng id câu hỏi vào trong bài kiểm tra')
    }
  }

}

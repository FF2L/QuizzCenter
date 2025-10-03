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
import { FilterChiTietBaiKiemTraDto } from './dto/filter-chi-tiet-bai-kiem-tra.dto';
import { DEFAULT_PAGE_LIMIT } from 'src/common/utiils/const.globals';

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

  async timTatCaBaiKiemTraTheoIdLopHocPhan(idLopHocPhan: number, filter: FilterChiTietBaiKiemTraDto) {
    await this.lopHocPhanService.timMotLopHocPhanTheoId(idLopHocPhan)
      try{
      const qb = this.chiTietCauHoiBaiKiemTraRepo.createQueryBuilder('ctch')
                .where('ctch.idLopHocPhan = :idLopHocPhan', {idLopHocPhan})
                .innerJoin('ctch.baiKiemTra', 'bkt') // JOIN sang BKT để lọc theo các field của BKT
                .innerJoin('ctch.cauHoi', 'ch')      // JOIN sang Câu hỏi để lấy nội dung
                // .leftJoinAndSelect('ch.dapAn', 'da') // nếu cần lấy đáp án

      if(filter.hienThiKetQua !== undefined) qb.andWhere('bkt.hienThiKetQua = :hienThiKetQua', {hienThiKetQua: filter.hienThiKetQua})
      if(filter.loaiKiemTra !== undefined) qb.andWhere('bkt.loaiKiemTra = :loaiKiemTra',{loaiKiemTra: filter.loaiKiemTra})
      if(filter.xemBaiLam !== undefined) qb.andWhere('bkt.xemBaiLam = :xemBaiLam',{xemBaiLam: filter.xemBaiLam} )
      
        qb.select([
      // chi tiết
      'ctch.id',
      'ctch.idBaiKiemTra',
      'ctch.idCauHoi',
      'ctch.update_at',
      // bài kiểm tra (nếu cần trả về)
      'bkt.id',
      'bkt.loaiKiemTra',
      'bkt.hienThiKetQua',
      'bkt.xemBaiLam',
        // câu hỏi 
      'ch.id',
      'ch.tenHienThi',
      'ch.noiDungCauHoi',
      'ch.loaiCauHoi',
      'ch.doKho',
        ]);
        return qb.orderBy('bkt.update_at','DESC')
                    .skip(filter.skip)
                    .take(filter.limit ?? DEFAULT_PAGE_LIMIT)
                    .getMany()
    }catch(err){
      throw new InternalServerErrorException('Lỗi khi lấy tất cả câu hỏi có trong bài kiểm tra')
    }

  }

  async timMotBaiKiemTraTheoIdBaiKiemTra(idBaiKiemTra: number){
    const baiKiemTra = await this.baiKiemTraRepo.findOne({where: {id: idBaiKiemTra}}, )
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


  /**CRUD câu hỏi trong bài kiểm tra */
  async layTatCaCauHoiCoTrongBaiKiemTraTheoIdBaiKiemTra(idBaiKiemTra: number, pagination:Pagination){
    await this.timMotBaiKiemTraTheoIdBaiKiemTra(idBaiKiemTra)
 
    try{
      const qb = this.chiTietCauHoiBaiKiemTraRepo.createQueryBuilder('ctch')
                .where('ctch.idBaiKiemTra = :idBaiKiemTra', {idBaiKiemTra})
                .innerJoin('ctch.baiKiemTra', 'bkt') // JOIN sang BKT để lọc theo các field của BKT
                .innerJoin('ctch.cauHoi', 'ch')      // JOIN sang Câu hỏi để lấy nội dung
                // .leftJoinAndSelect('ch.dapAn', 'da') // nếu cần lấy đáp án

        qb.select([
      // chi tiết
      'ctch.id',
      'ctch.idBaiKiemTra',
      'ctch.idCauHoi',
      'ctch.update_at',
      // bài kiểm tra (nếu cần trả về)
      'bkt.id',
      'bkt.loaiKiemTra',
      'bkt.hienThiKetQua',
      'bkt.xemBaiLam',
        // câu hỏi 
      'ch.id',
      'ch.tenHienThi',
      'ch.noiDungCauHoi',
      'ch.noiDungCauHoiHTML',
      'ch.loaiCauHoi',
      'ch.doKho',
        ]);
      const skip  = Math.max(0, Number(pagination?.skip ?? 0));
      const limit = Math.max(1, Number(pagination?.limit ?? DEFAULT_PAGE_LIMIT));
        return qb.orderBy('ctch.update_at','DESC')
                    .skip(skip)
                    .take(limit)
                    .getMany()
    }catch(err){
      throw new InternalServerErrorException('Lỗi khi lấy tất cả câu hỏi có trong bài kiểm tra')
    }
    

  }

  // async layTatCaCauHoiCoTrongBaiKiemTraTheoIdBaiKiemTra(idBaiKiemTra: number, filter: FilterChiTietBaiKiemTraDto){
  //   await this.timMotBaiKiemTraTheoIdBaiKiemTra(idBaiKiemTra)
    // try{
    //   const qb = this.chiTietCauHoiBaiKiemTraRepo.createQueryBuilder('ctch')
    //             .where('ctch.idBaiKiemTra = :idBaiKiemTra', {idBaiKiemTra})
    //             .innerJoin('ctch.baiKiemTra', 'bkt') // JOIN sang BKT để lọc theo các field của BKT
    //             .innerJoin('ctch.cauHoi', 'ch')      // JOIN sang Câu hỏi để lấy nội dung
    //             // .leftJoinAndSelect('ch.dapAn', 'da') // nếu cần lấy đáp án

    //   if(filter.hienThiKetQua !== undefined) qb.andWhere('bkt.hienThiKetQua = :hienThiKetQua', {hienThiKetQua: filter.hienThiKetQua})
    //   if(filter.loaiKiemTra !== undefined) qb.andWhere('bkt.loaiKiemTra = :loaiKiemTra',{loaiKiemTra: filter.loaiKiemTra})
    //   if(filter.xemBaiLam !== undefined) qb.andWhere('bkt.xemBaiLam = :xemBaiLam',{xemBaiLam: filter.xemBaiLam} )
      
    //     qb.select([
    //   // chi tiết
    //   'ctch.id',
    //   'ctch.idBaiKiemTra',
    //   'ctch.idCauHoi',
    //   'ctch.update_at',
    //   // bài kiểm tra (nếu cần trả về)
    //   'bkt.id',
    //   'bkt.loaiKiemTra',
    //   'bkt.hienThiKetQua',
    //   'bkt.xemBaiLam',
    //     // câu hỏi 
    //   'ch.id',
    //   'ch.tenHienThi',
    //   'ch.noiDungCauHoi',
    //   'ch.loaiCauHoi',
    //   'ch.doKho',
    //     ]);
    //     return qb.orderBy('ctch.update_at','DESC')
    //                 .skip(filter.skip)
    //                 .take(filter.limit ?? DEFAULT_PAGE_LIMIT)
    //                 .getMany()
    // }catch(err){
    //   throw new InternalServerErrorException('Lỗi khi lấy tất cả câu hỏi có trong bài kiểm tra')
    // }
    

  // }

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

  async capNhatMangCauHoiCoTrongBaiKiemTra(dto: CreateChiTietBaiKiemTraDto) {
  const { idBaiKiemTra } = dto;
  // lọc trùng + chỉ giữ số hợp lệ
  const ids = Array.from(new Set(dto.mangIdCauHoi.map(Number))).filter(Number.isFinite);

  return this.chiTietCauHoiBaiKiemTraRepo.manager.transaction(async (manager) => {
    const chiTietRepo = manager.getRepository(ChiTietCauHoiBaiKiemTra);

    // Nếu mảng rỗng: xóa hết chi tiết của bài kiểm tra
    if (ids.length === 0) {
      await chiTietRepo.delete({ idBaiKiemTra });
      return [];
    }

    // 1) XÓA: mọi dòng không nằm trong mảng ids
    await chiTietRepo
      .createQueryBuilder()
      .delete()
      .where('idBaiKiemTra = :idBaiKiemTra', { idBaiKiemTra })
      .andWhere('idCauHoi NOT IN (:...ids)', { ids })
      .execute();

    // 2) THÊM: chỉ chèn những id chưa tồn tại
    const existing = await chiTietRepo.find({
      where: { idBaiKiemTra },
      select: { idCauHoi: true },
    });
    const existedSet = new Set(existing.map((e) => e.idCauHoi));
    const toInsert = ids
      .filter((id) => !existedSet.has(id))
      .map((id) => ({ idBaiKiemTra, idCauHoi: id }));

    if (toInsert.length) {
      await chiTietRepo.insert(toInsert); // có @Unique thì sẽ không bị trùng dữ liệu
    }

    // 3) Trả về danh sách đã đồng bộ (kèm quan hệ nếu cần)
    return chiTietRepo.find({
      where: { idBaiKiemTra },
      relations: ['cauHoi'],
      order: { update_at: 'DESC' }, // nếu entity có cột này
    });
  });
}


}

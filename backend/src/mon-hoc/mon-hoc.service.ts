import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateMonHocDto } from './dto/create-mon-hoc.dto';
import { UpdateMonHocDto } from './dto/update-mon-hoc.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { MonHoc } from './entities/mon-hoc.entity';
import { Pagination } from 'src/common/dto/pagination.dto';
import { DEFAULT_PAGE_LIMIT } from 'src/common/utiils/const.globals';
import { UpdatePhanCongMonHocDto } from './dto/update-phan-cong-mon-hoc';
import { GiangVien } from 'src/giang-vien/entities/giang-vien.entity';
import { NguoiDung } from 'src/nguoi-dung/entities/nguoi-dung.entity';

@Injectable()
export class MonHocService {

  constructor(@InjectRepository(MonHoc) private monHocRepo: Repository<MonHoc> ,
  @InjectRepository(GiangVien) private giangVienRepo: Repository<GiangVien>,
  @InjectRepository(NguoiDung) private nguoiDungRepo: Repository<NguoiDung>
){}

  async timMotMonHocTheoId(idMonHod: number){
    try {
      const monHoc = await this.monHocRepo.findOne({
        where: {id: idMonHod}
    })

    if (!monHoc) throw new NotFoundException('Không tìm thấy môn học')

    return monHoc
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Lấy môn học thất bại');
    }
    
  }
    async layTatCaMonHocKhongQuery(){
      try {
        const danhSachMonHoc = await this.monHocRepo.find();
        return danhSachMonHoc
      } catch (error) {
        console.error(error);
        throw new InternalServerErrorException('Lấy môn học thất bại');
      }
    ;
  }

async layTatCaMonHocCuaGiangVien(query: any, userId: number) {
  try {
    const { skip, limit, maMon, tenMon } = query;
  
    const qb = this.monHocRepo.createQueryBuilder('mh')
                .innerJoin('mh.giangVien', 'gv')
                .innerJoin('gv.nguoiDung', 'nd')
                .where('nd.id = :userId', { userId })
                .skip(skip ?? 0)
                .take(limit ?? DEFAULT_PAGE_LIMIT)
    
    if (maMon) qb.andWhere('mh.maMonHoc LIKE :maMon', { maMon: `%${maMon}%` });
    if (tenMon) {qb.andWhere(`unaccent(mh.tenMonHoc) ILIKE unaccent(:tenMon)`,{ tenMon: `%${tenMon}%` });
  }

  const [data, total] = await qb.getManyAndCount();
    
    return {
      data,
      total,
      currentPage: Math.floor((skip ?? 0) / (limit ?? DEFAULT_PAGE_LIMIT)) + 1,
      totalPages: Math.ceil(total / (limit ?? DEFAULT_PAGE_LIMIT))
    };
  } catch (error) {
    console.error(error);
    throw new InternalServerErrorException('Lấy môn học của giảng viên thất bại');
  }
  
}

//CRUD môn học Admin

 async checkMonHoc (idMonHoc?: number, maMonHoc?: string, tenMonHoc?: string) {
    if(idMonHoc) {
      const existingMonHoc = await this.monHocRepo.findOne({
        where: { id: idMonHoc }
      });
      if(!existingMonHoc) throw new NotFoundException('Môn học không tồn tại');
      const monHocDaTrungMa = await this.monHocRepo.findOne({
        where: { maMonHoc: maMonHoc?.trim(), id : Not(idMonHoc)  }
      });
      if(monHocDaTrungMa) throw new BadRequestException('Mã môn học đã tồn tại');
      const monHocDaTrungTen = await this.monHocRepo.findOne({
        where: { tenMonHoc: tenMonHoc?.trim(), id : Not(idMonHoc)  }
      });
      if(monHocDaTrungTen) throw new BadRequestException('Tên môn học đã tồn tại'); 
      }
    else {
      const monHocDaTrungMa =  await this.monHocRepo.findOne({
        where: { maMonHoc: maMonHoc?.trim() }
      });
      if(monHocDaTrungMa) throw new BadRequestException('Mã môn học đã tồn tại');
      const monHocDaTrungTen =  await this.monHocRepo.findOne({
        where: { tenMonHoc: tenMonHoc?.trim() }
      });
      if(monHocDaTrungTen) throw new BadRequestException('Tên môn học đã tồn tại');
    }
 }
  async create(createMonHocDto: CreateMonHocDto) {
    const { maMonHoc, tenMonHoc } = createMonHocDto;
    await this.checkMonHoc(undefined, maMonHoc, tenMonHoc); 
    try {
      return await this.monHocRepo.save({
      maMonHoc,
      tenMonHoc
    });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Tạo môn học thất bại');
    }
    
  }
  findOne(id: number) {
    try {
      return this.monHocRepo.findOne({
        where: { id }
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Lấy môn học thất bại');
    }
  }
  async update(id: number, updateMonHocDto: UpdateMonHocDto) {
    const { maMonHoc, tenMonHoc } = updateMonHocDto;
    await this.checkMonHoc(id, maMonHoc, tenMonHoc);
    try {
      const monHoc = await this.monHocRepo.update(id, {
      maMonHoc,
      tenMonHoc
      });
      return await this.monHocRepo.findOne({
        where: { id }
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Cập nhật môn học thất bại');
    }
    
 
  }
  async remove(id: number) {


    const isLopHoc = await this.monHocRepo
      .createQueryBuilder('mh')
      .innerJoin('mh.lopHocPhan', 'lh')
      .where('mh.id = :id', { id })
      .getOne();

      
    console.log("Xóa môn học id:", id);

      if(isLopHoc) throw new BadRequestException('Không thể xóa môn học vì đã có lớp học');

      const res = await this.monHocRepo.delete(id);
      if(!res) throw new NotFoundException('Môn học không tồn tại');
      return {message: 'Xóa môn học thành công'}
    
  }
  async layTatCaMonHoc(query: any) {
    const { skip, limit, tenMon, sxTenMon } = query;
    try{
      const qb = this.monHocRepo.createQueryBuilder('mh')
    if(skip){
      qb.skip(skip);
    }else{
      qb.skip(0);
    }
    if(limit){
      qb.take(limit);
    }else{
      qb.take(DEFAULT_PAGE_LIMIT)
    }
    if(tenMon){
      qb.where(`unaccent(mh.tenMonHoc) ILIKE unaccent(:tenMon)`, { tenMon: `%${tenMon}%` });
    }


    if(sxTenMon === undefined){
      qb.addOrderBy('mh.tenMonHoc', 'ASC');
    }else if(sxTenMon === true){
      qb.addOrderBy('mh.tenMonHoc', 'DESC');
    }else if(sxTenMon === false){
      qb.addOrderBy('mh.tenMonHoc', 'ASC');
    }

    qb.addOrderBy('mh.create_at', 'ASC');
    const [data, total] = await qb.getManyAndCount();
    return {data,
            total,
            currentPage: Math.floor((skip ?? 0) / (limit ?? DEFAULT_PAGE_LIMIT)) + 1,
            totalPages: Math.ceil(total / (limit ?? DEFAULT_PAGE_LIMIT))}
    }catch(err){
      console.error(err);
      throw new InternalServerErrorException('Lấy danh sách môn học thất bại');
    }
  }
  
  async layTatCaMonHocGiangVienDaDcPhanCong(idGiangVien: number) {
    try {
      const danhSachMonHoc = await this.monHocRepo.find({
      where: {
        giangVien: {
          idNguoiDung: idGiangVien
        }
      }
    });
    return danhSachMonHoc;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Lấy danh sách môn học đã phân công thất bại');
    }
    
  }

  async layTatCaMonHocDaPhanCong(query: any) {
    try {
    const { skip, limit, tenGiangVien, sxTenGiangVien } = query;
    const qb = this.nguoiDungRepo.createQueryBuilder('nd')
    .innerJoinAndSelect('nd.giangVien', 'gv')
    .leftJoinAndSelect('gv.monHoc', 'mh')
    if(tenGiangVien){
      qb.andWhere(`unaccent(nd.hoTen) ILIKE unaccent(:tenGiangVien)`, { tenGiangVien: `%${tenGiangVien}%` });
    }
    const total = await qb.getCount();

   if(sxTenGiangVien === true){
      qb.addOrderBy('nd.hoTen', 'DESC');
    }else if(sxTenGiangVien === false){
      qb.addOrderBy('nd.hoTen', 'ASC');
    }

    const data = await qb.select([
      'mh.id',
      'mh.tenMonHoc',
      'gv.idNguoiDung',
      'nd.hoTen'
    ])
    .skip(skip ?? 0)
    .take(limit ?? DEFAULT_PAGE_LIMIT)
    .getRawMany()

    let danhSach = new Map<number, any>()
    console.log("data", data)
    data.forEach(item =>{
      if(!danhSach.has(item.gv_idNguoiDung)){
        danhSach.set(item.gv_idNguoiDung, {
          idnguoiDung: item.gv_idNguoiDung,
          hoTen: item.nd_hoTen,
          danhSachMonHoc: []
        })
      }
      danhSach.get(item.gv_idNguoiDung).danhSachMonHoc.push({
        id: item.mh_id, 
        tenMonHoc: item.mh_tenMonHoc
      })
    });


    return {data,
            danhSach: Array.from(danhSach.values()),
            total,
            currentPage: Math.floor((skip ?? 0) / (limit ?? DEFAULT_PAGE_LIMIT)) + 1,
            totalPages: Math.ceil(total / (limit ?? DEFAULT_PAGE_LIMIT))}
      
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Lấy danh sách môn học đã phân công thất bại');
    }

  }

  async phanCongChoGiangVien(req: any) {
    const { idMonHoc, idGiangVien } = req
      const existed = await this.giangVienRepo
      .createQueryBuilder('gv')
      .innerJoin('gv.monHoc', 'mh')
      .where('gv.idNguoiDung = :idGiangVien', { idGiangVien })
      .andWhere('mh.id = :idMonHoc', { idMonHoc })
      .getCount();
      
    if (existed > 0) {
      throw new NotFoundException('Môn học đã được phân công cho giảng viên này');
    }
      
    try{
        await this.giangVienRepo
          .createQueryBuilder()
          .relation(GiangVien, 'monHoc')
          .of(idGiangVien)
          .add(idMonHoc);
        return {message: 'Phân công thành công'};
    }catch(err){
      console.error(err);
      throw new InternalServerErrorException('Phân công thất bại');
    }
  }

  async xoaPhanCongMonHoc(idGiangVien: number, idMonHoc: number) {
    console.log("Xóa phân công môn học:", { idGiangVien, idMonHoc });
    try{
        await this.giangVienRepo
          .createQueryBuilder()
          .relation(GiangVien, 'monHoc')
          .of(idGiangVien)
          .remove(idMonHoc);
        return {message: 'Xóa phân công thành công'};
    }catch(err){
      console.error(err);
      throw new InternalServerErrorException('Xóa phân công thất bại');
    }
  }
}

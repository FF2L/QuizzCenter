import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateNguoiDungDto } from './dto/create-nguoi-dung.dto';
import { UpdateNguoiDungDto } from './dto/update-nguoi-dung.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { NguoiDung } from './entities/nguoi-dung.entity';
import { Not, Repository } from 'typeorm';
import { UpdateMatKhauDto } from './dto/update-mat-khau.dto';
import { Role } from 'src/common/enum/role.enum';
import { SinhVien } from 'src/sinh-vien/entities/sinh-vien.entity';
import { GiangVien } from 'src/giang-vien/entities/giang-vien.entity';
import { UpdateNguoiDungAdminDto } from './dto/update-nguoi-dung-admin';
import { DEFAULT_PAGE_LIMIT } from 'src/common/utiils/const.globals';

@Injectable()
export class NguoiDungService {

  constructor(
  @InjectRepository(NguoiDung) private nguoiDungRepo: Repository<NguoiDung>,
  @InjectRepository(SinhVien) private sinhVienRepo: Repository<SinhVien>,
  @InjectRepository(GiangVien) private giangVienRepo: Repository<GiangVien>
){}

  async timNguoiDungTheoEmail(email: string){
    return await this.nguoiDungRepo.findOne({
      where: {
        email
      }
    })
  }

  //Start CRUD người dùng
  async timTatCaNguoiDung(query: any){
    const {skip, limit, tenNguoiDung} = query;
    const qb = this.nguoiDungRepo.createQueryBuilder('ng')
              .where('ng.vaiTro IN (:...roles)', { roles: [Role.GiaoVien, Role.SinhVien]})
    if(tenNguoiDung){
      qb.andWhere('unaccent(ng.hoTen) ILIKE unaccent(:tenNguoiDung)', { tenNguoiDung: `%${tenNguoiDung}%` });
    }
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
    const [data, total] = await qb.getManyAndCount();
   
    return {data,
            total,
            currentPage: Math.floor((skip ?? 0) / (limit ?? total)) + 1,
            totalPages: Math.ceil(total / (limit ?? total))};
  }
  async taoNguoiDung(createNguoiDungDto: CreateNguoiDungDto) {
    const { maNguoiDung, hoTen, email, matKhau, soDienThoai, gioiTinh, ngaySinh, vaiTro } = createNguoiDungDto

    const kiemTraNguoiDung = await this.nguoiDungRepo.findOne({
      where: {
        email
      }
    })
    if (kiemTraNguoiDung) throw new BadRequestException('Email đã tồn tại')

          const nguoiDungCoMaGiong = await this.nguoiDungRepo.findOne({
      where: { maNguoiDung }
    });
    if(nguoiDungCoMaGiong) throw new BadRequestException('Mã người dùng đã tồn tại');

    const nguoiDung = this.nguoiDungRepo.create({
      maNguoiDung,
      hoTen,
      email,
      matKhau,
      gioiTinh,
      soDienThoai,
      ngaySinh,
      vaiTro
    });
    try {
      const nguoiDungSave = await this.nguoiDungRepo.save(nguoiDung);
      if(vaiTro === Role.GiaoVien){
        const giangVien = this.giangVienRepo.create({
          idNguoiDung: nguoiDungSave.id,
        })
          await this.giangVienRepo.save(giangVien);
      }else if(vaiTro === Role.SinhVien){
        const sinhVien = this.sinhVienRepo.create({
          idNguoiDung: nguoiDungSave.id,
        })
        await this.sinhVienRepo.save(sinhVien);
      }
      return nguoiDungSave;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Tạo người dùng thất bại');
    }
  }
  async updateNguoiDung(id:number,dto: UpdateNguoiDungAdminDto){
    const {hoTen, soDienThoai, email, ngaySinh,gioiTinh, matKhau, maNguoiDung} = dto
    const nguoiDung = await this.nguoiDungRepo.findOne({
      where: { id: id}
    });

    const nguoiDungCoEmailKhac = await this.nguoiDungRepo.findOne({
      where: { email: email, id: Not(id) }
    });
    if(nguoiDungCoEmailKhac) throw new BadRequestException('Email đã được sử dụng bởi người dùng khác');

    const nguoiDungCoMaGiong = await this.nguoiDungRepo.findOne({
      where: { maNguoiDung: maNguoiDung, id: Not(id) }
    });
    if(nguoiDungCoMaGiong) throw new BadRequestException('Mã người dùng đã được sử dụng bởi người dùng khác');

    if(!nguoiDung) throw new NotFoundException();
    nguoiDung.hoTen = hoTen;
    nguoiDung.matKhau = matKhau;
    nguoiDung.soDienThoai = soDienThoai;
    nguoiDung.gioiTinh = gioiTinh;
    nguoiDung.email = email;
    nguoiDung.ngaySinh = ngaySinh;
    try {
      return await this.nguoiDungRepo.save(nguoiDung);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Cập nhật người dùng thất bại');
    }
  }
  async xoaNguoiDung(idNguoiDung: number){
    const res =  await this.nguoiDungRepo.softDelete({id: idNguoiDung});
    if(res.affected ===0) throw new NotFoundException();
    return {message: 'Xóa người dùng thành công'}
  }
  // End CRUD người dùng

  //Phục vu cho giảng vien
  async layTatCaNguoiDungTheoVaiTro(vaiTro:Role){
    return await this.nguoiDungRepo.find({where: {vaiTro: vaiTro} });
  }
  //End phục vụ cho giảng viên


  async layThongTinCuaNguoiDung(idNguoiDung: number) {
       const nguoiDung = await this.nguoiDungRepo.findOne({
      where: { id: idNguoiDung}
    });
    if(!nguoiDung) 
      throw new NotFoundException();
    const {matKhau,hashRefeshToken,vaiTro, ...nguoiDungLoaiBoMatKhau} = nguoiDung
    return nguoiDungLoaiBoMatKhau
  }

  async update(id: number, updateNguoiDungDto: UpdateNguoiDungDto) {
     const nguoiDung = this.nguoiDungRepo.preload({id, ...updateNguoiDungDto})
    try {
      if (!nguoiDung) throw new NotFoundException();
      const data =  await this.nguoiDungRepo.update(id, updateNguoiDungDto)
      if(data.affected ===0) throw new NotFoundException();
      return await this.layThongTinCuaNguoiDung(id);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Cập nhật thông tin người dùng thất bại');
    }
  }

    async timMotNguoiDungTheoId(idNguoiDung: number) {
       const nguoiDung = await this.nguoiDungRepo.findOne({
      where: { id: idNguoiDung}
    });
    if(!nguoiDung) 
      throw new NotFoundException();
    const {matKhau, ...nguoiDungLoaiBoMatKhau} = nguoiDung
    return nguoiDungLoaiBoMatKhau
  }

  async updateMatKhau(id: number, updatematKhauDto: UpdateMatKhauDto) {
    const{matKhauMoi, matKhauCu} = updatematKhauDto
    const nguoiDung = await this.nguoiDungRepo.findOne({
      where: { id: id}
    });
    if(!nguoiDung) 
      throw new NotFoundException();
    if(matKhauCu !== nguoiDung.matKhau) throw new BadRequestException('Mật khẩu cũ không chính xác')
      try{
        const data =  await this.nguoiDungRepo.update(id, {matKhau: matKhauMoi})
        if(data.affected ===0) throw new NotFoundException();
        return {messages: "ok"};
      } catch (error) {
        console.error(error);
      throw new InternalServerErrorException('Cập nhật mật khẩu thất bại');
    }

  }

  //Phục vụ cho xác thực và lưu refesh token mới
  async timVaUpdateRefeshToken(idNguoiDung: number, hashRefeshToken:string){

     return await this.nguoiDungRepo.update({id: idNguoiDung},{hashRefeshToken: hashRefeshToken})
  }

  async capNhatMatKhauTheoId(id:number, newPass: string){
    try {
      return await this.nguoiDungRepo.update(id, { matKhau: newPass})
     
    } catch (error) {
          console.error(error);
        throw new InternalServerErrorException('Cập nhật mật khẩu thất bại');
    }
  }
}

import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateNguoiDungDto } from './dto/create-nguoi-dung.dto';
import { UpdateNguoiDungDto } from './dto/update-nguoi-dung.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { NguoiDung } from './entities/nguoi-dung.entity';
import { Repository } from 'typeorm';

@Injectable()
export class NguoiDungService {

  constructor(@InjectRepository(NguoiDung) private nguoiDungRepo: Repository<NguoiDung>){}

  async timNguoiDungTheoEmail(email: string){
    return await this.nguoiDungRepo.findOne({
      where: {
        email
      }
    })
  }

  create(createNguoiDungDto: CreateNguoiDungDto) {
    return 'This action adds a new nguoiDung';
  }

  findAll() {
    return `This action returns all nguoiDung`;
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

  update(id: number, updateNguoiDungDto: UpdateNguoiDungDto) {
    return `This action updates a #${id} nguoiDung`;
  }

  remove(id: number) {
    return `This action removes a #${id} nguoiDung`;
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

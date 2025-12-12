import { Chuong } from 'src/chuong/entities/chuong.entity';
import { GiangVienService } from './../giang-vien/giang-vien.service';
import { BadRequestException, forwardRef, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateChuongDto } from './dto/create-chuong.dto';
import { UpdateChuongDto } from './dto/update-chuong.dto';
import { MonHocService } from 'src/mon-hoc/mon-hoc.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CauHoiService } from 'src/cau-hoi/cau-hoi.service';
import { BaiKiemTra } from 'src/bai-kiem-tra/entities/bai-kiem-tra.entity';
import { ChiTietCauHoiBaiKiemTra } from 'src/bai-kiem-tra/entities/chi-tiet-cau-hoi-bai-kiem-tra';

@Injectable()
export class ChuongService {

  constructor( @InjectRepository(Chuong) private chuongRepo : Repository<Chuong>,
              @InjectRepository(BaiKiemTra) private baiKiemTraRepo : Repository<BaiKiemTra>,
              @InjectRepository(ChiTietCauHoiBaiKiemTra) private chiTietCauHoiBaiKiemTraRepo : Repository<ChiTietCauHoiBaiKiemTra>,
              private giangVienService: GiangVienService,
              private monHocService: MonHocService,
              @Inject(forwardRef(() => CauHoiService)) private cauHoiService: CauHoiService
  ) {}

  async layChuongNgauNhienTheoMonHoc(idBaiKiemTra: number, idNguoiDung: number) {
    console.log("Fetching random chapters for test ID:", idBaiKiemTra, "and user ID:", idNguoiDung);
    const qb1 = await this.baiKiemTraRepo.createQueryBuilder('bkt')
                .innerJoin('bkt.chiTietCauHoiBaiKiemTra', 'ctchbkt')

    const mangId = await qb1.select(['ctchbkt.idCauHoi AS idCauHoi'])
                .where('bkt.id = :idBaiKiemTra', { idBaiKiemTra })
                .getRawMany()
    console.log("Question IDs already in test (raw):", mangId);
    
    const mangIdCauHoii = mangId.map(item => item.idcauhoi);

    console.log("Question IDs already in test:", mangIdCauHoii);

      
    const qb = await this.baiKiemTraRepo.createQueryBuilder('bkt')
                .innerJoin('bkt.lopHocPhan', 'lhp')
                .innerJoin('lhp.giangVien', 'gv')
                .innerJoin('gv.nguoiDung', 'nd')
                .innerJoin('lhp.monHoc', 'mh')
                .innerJoin('mh.chuong', 'c')
                .innerJoin('c.cauHoi', 'ch')
                .andWhere('nd.id = :idNguoiDung', { idNguoiDung })
                .andWhere('bkt.id = :idBaiKiemTra', { idBaiKiemTra })
                .groupBy('c.id')
                if(mangId.length > 0)
                 qb.andWhere(`ch.id NOT IN (:...mangId)`, { mangId: mangIdCauHoii }) 
                
                
    return await qb.select([
      'c.id AS id', 
      'c.tenChuong AS tenChuong',
      'COUNT(ch.id) AS soLuongCauHoi',
      'c.create_at AS create_at',
    ])
    .orderBy('c.create_at', 'ASC')
    .getRawMany()
  }

  async layCauHoiNgauNhienTheoChuong(
  soLuong: number,
  idBaiKiemTra: number,
  idChuong: number,
  idNguoiDung: number
) {
  console.log("Fetching random questions for test ID:", idBaiKiemTra);

  // Lấy danh sách câu hỏi đã có trong bài kiểm tra
  const qb1 = this.baiKiemTraRepo.createQueryBuilder('bkt')
    .innerJoin('bkt.chiTietCauHoiBaiKiemTra', 'ctchbkt');

  const mangId = await qb1
    .select(['ctchbkt.idCauHoi AS idCauHoi'])
    .where('bkt.id = :idBaiKiemTra', { idBaiKiemTra })
    .getRawMany();

  const mangIdCauHoii = mangId.map(item => item.idcauhoi);

  // Query lấy câu hỏi random
  const qb = this.chuongRepo.createQueryBuilder('c')
    .innerJoin('c.giangVien', 'gv')
    .innerJoin('gv.nguoiDung', 'nd')
    .innerJoin('c.cauHoi', 'ch')
    .where('c.id = :idChuong', { idChuong })
    .andWhere('nd.id = :idNguoiDung', { idNguoiDung });

  // Nếu đã có câu hỏi → loại bỏ
  if (mangIdCauHoii.length > 0) {
    qb.andWhere(`ch.id NOT IN (:...mangId)`, { mangId: mangIdCauHoii });
  }

  // SELECT phải đứng trước ORDER BY + LIMIT
  const cauHoi = await qb
    .select(['ch.id AS id'])
    .orderBy('RANDOM()')
    .limit(soLuong)
    .getRawMany();

  const cauHoiIds = cauHoi.map(item => item.id);

  // Tạo danh sách chi tiết bài kiểm tra
  const danhSachChiTiet = cauHoiIds.map(id =>
    this.chiTietCauHoiBaiKiemTraRepo.create({
      idCauHoi: id,
      idBaiKiemTra: idBaiKiemTra,
    })
  );

  return await this.chiTietCauHoiBaiKiemTraRepo.save(danhSachChiTiet);
}



  async taoMotChuong (createChuongDto: CreateChuongDto,id:number){
    const giangVien = await this.giangVienService.timGiangVienTheoId(id)
    const monHoc = await this.monHocService.timMotMonHocTheoId(createChuongDto.idMonHoc)

    const chuong = this.chuongRepo.create({ //create là hàm tạo instance từ entity kiểm tra xem có đúng kiểu không trước khi import vào
      tenChuong: createChuongDto.tenChuong,
      idGiangVien: id, 
      idMonHoc: createChuongDto.idMonHoc,  
    })

    try{
      return await this.chuongRepo.save(chuong)
    }catch (err) {
        throw new InternalServerErrorException('Không thể tạo chương');
    }

  }


async layTatCaChuongTheoMonHocVaNguoiDung(idMonHoc: number, idNguoiDung: number) {
  const qb = this.chuongRepo.createQueryBuilder('c')
              .innerJoin('c.giangVien', 'gv')
              .innerJoin('gv.nguoiDung', 'nd')
              .leftJoinAndSelect('c.cauHoi', 'ch')
              .where('c.idMonHoc = :idMonHoc', { idMonHoc })
              .andWhere('nd.id = :idNguoiDung', { idNguoiDung })
              .orderBy('c.create_at', 'ASC') // Sắp xếp theo thứ tự tạo
              .groupBy('c.id'); // Nhóm theo ID chương để đếm số lượng câu hỏi chính xác
              
  const chuong = await qb.select(
    ['c.id AS id', 'c.tenChuong AS tenChuong', 
      'COUNT(ch.id) AS soLuongCauHoi', 
     ]
  ).getRawMany()
  
  return chuong;
}

  async timMotChuongTheoId(id: number) {
    const chuong= await this.chuongRepo.findOne({
      where: {id}
    })
    if (!chuong) throw new NotFoundException('Không tìm thấy chương')
      return chuong
  }

  async capNhatChuong(id: number, updateChuongDto: UpdateChuongDto) {
    //preload nghĩa là nó sẽ tìm ở dưới database xem đã có chưa chưa có thì trả về undefine có rồi thì thay thế trường cần thay thế vào
    //sau khi dùng preload nếu dùng repo.save thì type orm hiểu đây là một cái cần update thì nó sẽ chạy hook before update trong entity
    //và cuối cùng nếu preload thành công mình sẽ có một instance của chương nó sẽ kiểm tra validate trong entity nếu trường nào sai nó sẽ lỗi
    
    const chuong = await this.chuongRepo.preload({id, ...updateChuongDto}) 
    if(!chuong) throw new NotFoundException(`Không tìm thấy chương với id: ${id}`)

      try{
        return await this.chuongRepo.save(chuong)
      }catch(err){
        throw new InternalServerErrorException('Cập nhật chương không thành công')
      }
     
  }

  async layTatCauHoiTheoChuong(idChuong: number, query: any){
    const { skip, limit, doKho, noiDungCauHoi } = query;
    const chuong = await this.timMotChuongTheoId(idChuong)

    return await this.cauHoiService.layTatCaCauHoiTheoIdChuong(idChuong,{ skip, limit, doKho, noiDungCauHoi })

  }

  async xoaChuongTheoIdChuong(id: number) {
    const chuong = await this.timMotChuongTheoId(id)
    if(+chuong.soLuongCauHoi>0)
      throw new BadRequestException('Không thể xóa chương có câu hỏi')
    else
      return await this.chuongRepo.delete(id);
  } 
}

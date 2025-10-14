import { NguoiDung } from 'src/nguoi-dung/entities/nguoi-dung.entity';
import { OtpService } from './../otp/otp.service';
import { JwtAuthPayLoad } from './types/auth-jwtPayLoad';
import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { NguoiDungService } from 'src/nguoi-dung/nguoi-dung.service';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import refeshJwtConfig from 'src/config/refeshJwt.config';
import * as argon2 from "argon2"
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { MailService } from 'src/mail/mail.service';
import Redis from 'ioredis';

@Injectable()
export class AuthService {

    constructor(private nguoiDungService: NguoiDungService,
         private jwtService: JwtService,
         @Inject (refeshJwtConfig.KEY) private refeshJwtConfiguration: ConfigType<typeof refeshJwtConfig>,
        private otpService: OtpService,
         @Inject('REDIS') private readonly redis: Redis,
        ){}



    /**
     * hàm dùng trong controller
     */
    async dangNhap(idNguoiDUng: number) {
        return await this.taoAccessTokenVaRefeshToken(idNguoiDUng)
    }

    async refesh(idNguoiDung: number){
        return await this.taoAccessTokenVaRefeshToken(idNguoiDung)
    }

    async dangXuat(userId:number){
 
        return await this.nguoiDungService.timVaUpdateRefeshToken(userId,'')
    }


    /**
     * validate trong strategies
     */
    async xacThucRefeshToken(idNguoiDUng:number, refeshToken:string){
        const nguoiDung = await this.nguoiDungService.timMotNguoiDungTheoId(idNguoiDUng)
        if(!nguoiDung || !nguoiDung.hashRefeshToken) throw new UnauthorizedException('Người dùng đã đăng xuất hoặc không tồn tại')
        const kiemTraRefeshToken = await argon2.verify(nguoiDung.hashRefeshToken,refeshToken)
        if(!kiemTraRefeshToken) throw new UnauthorizedException('Refesh Token Không đúng hoặc đã hết hạn')
        return {id: idNguoiDUng}
    }
     //Dùng khi người dùng nhập email và mật khẩu vào khi đăng nhập
    async xacThucNguoiDung(email: string, matKhau: string){

        const nguoiDung = await this.nguoiDungService.timNguoiDungTheoEmail(email)
        if(!nguoiDung) throw new UnauthorizedException('Không tìm thấy người dùng')

        // const kiemTraMatKhau = await bcrypt.compare(matKhau, nguoiDung.matKhau)
        // if(!kiemTraMatKhau) throw new UnauthorizedException('thông tin không xác thực')

        if( matKhau!== nguoiDung.matKhau) throw new UnauthorizedException('thông tin không xác thực')
            return {id: nguoiDung.id} 

    }

    async xacThucNguoiDungJWT (idNguoiDung: number){
        const nguoiDung = await this.nguoiDungService.timMotNguoiDungTheoId(idNguoiDung)
        if(!nguoiDung) throw new UnauthorizedException('Không tìm thấy  người dùng')

        return {id: nguoiDung.id, role: nguoiDung.vaiTro}
        
    }

    async quenMatKhau (email: string){
        const nguoiDung = await this.nguoiDungService.timNguoiDungTheoEmail(email)
        if(!nguoiDung) throw new BadRequestException('Email không tôn tại')
        return this.otpService.send(email)
    }

    async xacThucOtp(email: string, code:string){
        const nguoiDung = await this.nguoiDungService.timNguoiDungTheoEmail(email)
        if(!nguoiDung) throw new NotFoundException('Email không tôn tại')
        return await this.otpService.verify(email, code)
    }

    async guiLaiOtp(email) {
        const nguoiDung = await this.nguoiDungService.timNguoiDungTheoEmail(email)
        if(!nguoiDung) throw new NotFoundException('Email không tôn tại')
        return this.otpService.resend(email)
    }

    async resetPasswordWithToken(token: string, newPassword: string) {
    if (!token) throw new BadRequestException('Thiếu token');
    if (!newPassword || newPassword.length < 8) {
      throw new BadRequestException('Mật khẩu mới phải tối thiểu 8 ký tự');
    }

    // Lấy email từ token (single source of truth)
    const email = await this.redis.get(`pwdreset:${token}`);
    if (!email) throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');

    const user = await this.nguoiDungService.timNguoiDungTheoEmail(email);
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    // const hash = await bcrypt.hash(newPassword, 10);

    try {
      await this.nguoiDungService.capNhatMatKhauTheoId(user.id, newPassword);

      // Hủy token để single-use
      await this.redis.del(`pwdreset:${token}`);

      // (tuỳ chọn) hủy refresh-token hiện tại để buộc đăng nhập lại
      // await this.nguoiDungRepo.update({ id: user.id }, { refreshToken: null });

      return { ok: true, message: 'Đổi mật khẩu thành công' };
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException('Cập nhật mật khẩu thất bại');
    }
  }




    
    /** 
     * hàm dùng trong service auth
    */
    async taoAccessTokenVaRefeshToken(idNguoiDUng: number){
        const payload: JwtAuthPayLoad = {idNguoiDung: idNguoiDUng}
        const [accessToken, refeshToken] = await Promise.all([
            this.jwtService.sign(payload),
            this.jwtService.sign(payload, this.refeshJwtConfiguration)// sử dụng refeshcofig để tạo cho refesh token
        ])
        const hashRefeshToken = await argon2.hash(refeshToken)
        await this.nguoiDungService.timVaUpdateRefeshToken(idNguoiDUng, hashRefeshToken);
        const nguoiDung = await this.nguoiDungService.timMotNguoiDungTheoId(idNguoiDUng)
        return {accessToken, refeshToken, vaiTro: nguoiDung.vaiTro}
    }



}

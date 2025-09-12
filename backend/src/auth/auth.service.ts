import { JwtAuthPayLoad } from './types/auth-jwtPayLoad';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { NguoiDungService } from 'src/nguoi-dung/nguoi-dung.service';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import refeshJwtConfig from 'src/config/refeshJwt.config';
import * as argon2 from "argon2"
import { NguoiDung } from 'src/nguoi-dung/entities/nguoi-dung.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthService {

    constructor(private nguoiDungService: NguoiDungService,
         private jwtService: JwtService,
         @Inject (refeshJwtConfig.KEY) private refeshJwtConfiguration: ConfigType<typeof refeshJwtConfig>,
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
        return {accessToken, refeshToken}
        
    }


}

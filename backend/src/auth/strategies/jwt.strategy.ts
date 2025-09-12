import { Inject, Injectable } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import { ConfigType } from "@nestjs/config"
import jwtConfig from "src/config/jwt.config"
import { JwtAuthPayLoad } from "../types/auth-jwtPayLoad"
import { AuthService } from "../auth.service"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor (@Inject(jwtConfig.KEY) private jwtConfiguration: ConfigType<typeof jwtConfig>,
                    private authService: AuthService
){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtConfiguration.secret!, //Thêm chấm thang vào để cam kết đây là giá trị không null
            ignoreExpiration: false, //Không bỏ qua thời gian hết hạn
        });
    
    }

    async validate(payload : JwtAuthPayLoad){
        const idNguoiDung = payload.idNguoiDung
        return await this.authService.xacThucNguoiDungJWT(idNguoiDung)
    }
}
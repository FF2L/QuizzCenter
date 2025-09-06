import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import refeshJwtConfig from "src/config/refeshJwt.config";
import { AuthService } from "../auth.service";
import { Request } from "express";
import { UnauthorizedException } from "@nestjs/common";
import { JwtAuthPayLoad } from "../types/auth-jwtPayLoad";

@Injectable()
export class RefeshJwtStrategy extends PassportStrategy(Strategy, 'refresh-jwt') {
    constructor(@Inject(refeshJwtConfig.KEY) private refeshJwtConfiguration : ConfigType<typeof refeshJwtConfig>,
                 private authService: AuthService)  {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false, // Không bỏ qua thời gian hết hạn 
            secretOrKey: refeshJwtConfiguration.secret!, //! là để không bị lỗi undefined đảm bảo rằng secret đã được cung cấp
            passReqToCallback: true  //Cho phép truy cập vào request trong validate
        })
    }
    //trong việc gọi api refesh thì token sẽ được truyền bằng header{"authorization": "Bearer sdfasf*@safas"} 
    async validate(req: Request, payload : JwtAuthPayLoad){
        const refeshTolen = req.get('authorization')?.replace('Bearer ', '').trim()
        if (!refeshTolen) throw new UnauthorizedException('Refesh Token không được cung cấp')
        return await this.authService.xacThucRefeshToken(payload.idNguoiDung, refeshTolen)
    }
}
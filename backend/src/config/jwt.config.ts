import { registerAs } from "@nestjs/config";
import { JwtModuleOptions } from "@nestjs/jwt";

//Hàm registerAs() được dùng để định nghĩa các cấu hình (config) theo một tên định danh (namespace)
//  trong NestJS – giúp dễ quản lý và inject các cấu hình riêng biệt.
export default registerAs ( "jwt",()  :JwtModuleOptions =>({   
    secret: process.env.JWT_KEY,
    signOptions: ({
        expiresIn: process.env.JWT_EXPIRATION
    })
}))
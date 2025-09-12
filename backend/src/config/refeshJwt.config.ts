import { registerAs } from "@nestjs/config";
import { JwtModuleOptions, JwtSignOptions } from "@nestjs/jwt";

//Hàm registerAs() được dùng để định nghĩa các cấu hình (config) theo một tên định danh (namespace)
//  trong NestJS – giúp dễ quản lý và inject các cấu hình riêng biệt.
export default registerAs ( "refesh_jwt",
    ()  : JwtSignOptions =>({   
    secret: process.env.REFESH_JWT_KEY,
    expiresIn: process.env.REFESH_EXPRIATION
    
}))
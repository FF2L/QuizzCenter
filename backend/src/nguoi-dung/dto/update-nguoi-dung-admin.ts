import { IsDate, IsEmail, IsString } from "class-validator";

export class UpdateNguoiDungAdminDto {

        @IsString()
        maNguoiDung: string;

        @IsString()
        hoTen: string;

        @IsString()
        soDienThoai: string;

        @IsString()
        gioiTinh: string;

        @IsEmail()
        email: string;
    
        @IsDate()
        ngaySinh: Date;
    
        @IsString()
        matKhau: string;
}
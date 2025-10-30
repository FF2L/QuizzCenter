import { IsDate, IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { Role } from "src/common/enum/role.enum";

export class CreateNguoiDungDto {
    @IsString()
    maNguoiDung: string;

    @IsString()
    hoTen: string;

    @IsEmail()
    email: string;

    @IsString()
    soDienThoai: string;

    @IsString()
    @IsOptional()
    gioiTinh: string;

    @IsString()
    @IsOptional()
    matKhau: string;

    @IsDate()
    ngaySinh: Date;

    @IsEnum(Role)
    vaiTro: Role;
}

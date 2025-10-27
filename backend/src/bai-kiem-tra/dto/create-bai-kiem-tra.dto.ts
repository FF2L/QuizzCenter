
import { IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";
import { LoaiKiemTra } from "src/common/enum/loaiKiemTra.enum";

export class CreateBaiKiemTraDto {
    @IsString()
    tenBaiKiemTra:string

    @IsOptional()
    @IsEnum( LoaiKiemTra, {message: 'loaiCauHoi phải là một trong các giá trị: ' + Object.values(LoaiKiemTra).join(', ')})
    loaiKiemTra?: LoaiKiemTra

    @IsDate()
    thoiGianBatDau: Date

    @IsDate()
    thoiGianKetThuc: Date
    
    @IsNumber()
    @IsPositive()
    thoiGianLam: number

    @IsNumber()
    @IsPositive()
    idLopHocPhan: number
}

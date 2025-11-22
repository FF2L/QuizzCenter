import { IsBoolean, IsDate, isDate, IsString } from "class-validator"

export class CreateHocKyDto {
    @IsString()
    tenHocKy: string
    @IsDate()
    thoiGianBatDau: Date
    @IsDate()   
    thoiGianKetThuc: Date
    @IsBoolean()
    phatHanh: boolean
}

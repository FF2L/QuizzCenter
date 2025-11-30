import { IsBoolean, IsDate, isDate, IsNumber, IsOptional, IsString } from "class-validator"

export class CreateHocKyDto {
    @IsNumber()
    @IsOptional()
    id?: number

    @IsString()
    tenHocKy: string
    @IsDate()
    thoiGianBatDau: Date
    @IsDate()   
    thoiGianKetThuc: Date
    @IsBoolean()
    phatHanh: boolean
}

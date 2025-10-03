import { IsArray, IsNumber, IsString } from "class-validator";

export class CreateChiTietBaiKiemTraDto{

    @IsNumber()
    idBaiKiemTra: number

    @IsArray()
    mangIdCauHoi: number[]
}
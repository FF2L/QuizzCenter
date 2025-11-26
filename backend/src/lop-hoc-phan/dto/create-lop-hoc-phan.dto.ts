import { IsDate, IsNumber, IsString } from "class-validator";

export class CreateLopHocPhanDto {
    @IsString()
    tenLopHoc: string;
    @IsNumber()
    hocKy: number;
    @IsNumber()
    idMonHoc: number;
    @IsNumber()
    idGiangVien: number;
}

import { IsDate, IsNumber, IsString } from "class-validator";

export class CreateLopHocPhanDto {
    @IsString()
    tenLopHoc: string;
    @IsString()
    hocKy: string;
    @IsDate()
    thoiGianBatDau: Date;
    @IsDate()
    thoiGianKetThuc: Date;
    @IsNumber()
    idMonHoc: number;
    @IsNumber()
    idGiangVien: number;
}

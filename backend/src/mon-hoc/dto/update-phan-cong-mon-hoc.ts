import { Type } from "class-transformer";
import { IsArray, IsNumber, IsString } from "class-validator";

export class UpdatePhanCongMonHocDto {
    @IsNumber()
    idGiangVien: number;
    
    @IsArray()
    @Type(() => Number)
    danhSachIdMonHoc: number[];

}
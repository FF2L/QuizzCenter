import { IsInt, IsNotEmpty, IsPositive, IsString } from "class-validator";

export class CreateChuongDto {
    @IsString()
    @IsNotEmpty()
    tenChuong: string

    @IsInt()
    @IsPositive()
    thuTu: number

    @IsInt()
    idGiangVien: number

    @IsInt()
    idMonHoc: number

}

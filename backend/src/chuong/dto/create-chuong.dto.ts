import { IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from "class-validator";

export class CreateChuongDto {
    @IsString()
    @IsNotEmpty()
    tenChuong: string

    @IsInt()
    idMonHoc: number

}

import { IsInt } from "class-validator";


export class FindAllChuongDto {
    @IsInt()
    idMonHoc: number
}

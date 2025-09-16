import { Type } from "class-transformer";
import { IsInt } from "class-validator";


export class FindAllChuongDto {
     @Type(() => Number)
    @IsInt()
    idMonHoc: number
}

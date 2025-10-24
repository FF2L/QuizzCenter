import { IsJSON, IsNumber, IsOptional, IsString } from "class-validator"


export class UpdateMatKhauDto /**extends PartialType(CreateNguoiDungDto)**/ {

    @IsString()
    matKhauMoi: string

    @IsString()
    matKhauCu: string

}
import { Transform } from 'class-transformer';
import * as sanitizeHtml from 'sanitize-html'
import { CreateDapAnDto } from './../../dap-an/dto/create-dap-an.dto';
import { IntersectionType } from "@nestjs/mapped-types";
import { IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
import { DoKho } from "src/common/enum/dokho.enum";
import { LoaiCauHoi } from "src/common/enum/loaicauhoi.enum";
import { SANITIZE_OPTS } from 'src/common/options/sanitize-html.option';


class CauHoitDto {
        @IsString()
    tenHienThi: string

    @IsString()
    noiDungCauHoi: string
    
    @Transform(({ value }) => sanitizeHtml(value ?? '', SANITIZE_OPTS))
    @IsString()
    @IsOptional()
    noiDungCauHoiHTML: string
    
    @IsEnum(LoaiCauHoi,
    {
    message: 'loaiCauHoi phải là một trong các giá trị: ' + Object.values(LoaiCauHoi).join(', ')
    })
    @IsOptional()
    loaiCauHoi: LoaiCauHoi

    @IsOptional()
    idPublic:string

    @IsEnum(DoKho,{
        message: 'doKho phải là một trong các giá trị: ' + Object.values(DoKho).join(', ')
    })
    @IsOptional()
    doKho : DoKho

    @IsNumber()
    @IsOptional()
    idChuong: number
}
export class CreateCauHoiDto extends IntersectionType(
    CauHoitDto,
    CreateDapAnDto,
){}


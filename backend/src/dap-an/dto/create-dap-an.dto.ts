import * as sanitizeHtml from 'sanitize-html'
import { Transform, Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, ValidateNested } from "class-validator";


export class DapAnDto {
    @IsString()
    @IsNotEmpty()
    noiDung: string

    @IsString()
    @IsOptional()
    noiDungHTML: string


    @IsBoolean()
    @IsOptional()
    dapAnDung: boolean

}

export class CreateDapAnDto {
    @IsArray()
    @ArrayMinSize(4,{message: 'Mảng đáp án ít nhất phải có 4 phần tử'})
    @ValidateNested({ each: true })
    @Type(() => DapAnDto)        // bắt buộc để lồng Dto hoạt động
    mangDapAn: DapAnDto[];

}

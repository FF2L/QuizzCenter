import { Transform } from "class-transformer"
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator"
import * as sanitizeHtml from 'sanitize-html'
import { SANITIZE_OPTS } from "src/common/options/sanitize-html.option"

export class CreateMotDapAn {
        @IsString()
        @IsNotEmpty()
        noiDung: string
    
        @IsBoolean()
        @IsOptional()
        dapAnDung: boolean

        @IsOptional()
        publicId: string

        @Transform(({ value }) => sanitizeHtml(value ?? '', SANITIZE_OPTS))
        @IsString()
        @IsOptional()
        noiDungHTML: string

        @IsNumber()
        @IsPositive()
        idCauHoi : number
}
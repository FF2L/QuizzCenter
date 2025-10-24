import { Transform } from "class-transformer"
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator"



export class CreateMotDapAn {
        @IsString()
        @IsNotEmpty()
        noiDung: string
    
        @IsBoolean()
        dapAnDung: boolean

        @IsString()
        noiDungHTML: string

        @IsNumber()
        @IsPositive()
        idCauHoi : number
}
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator"


export class CreateMotDapAn {
        @IsString()
        @IsNotEmpty()
        noiDung: string
    
        @IsBoolean()
        @IsOptional()
        dapAnDung: boolean

        @IsNumber()
        @IsPositive()
        idCauHoi : number
}
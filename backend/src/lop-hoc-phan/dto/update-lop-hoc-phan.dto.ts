import { PartialType } from '@nestjs/mapped-types';
import { CreateLopHocPhanDto } from './create-lop-hoc-phan.dto';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class UpdateLopHocPhanDto {
        @IsString()
        tenLopHoc: string;
        @IsNumber()
        hocKy: number;
        @IsNumber()
        idMonHoc: number;
        @IsNumber()
        idGiangVien: number;
}

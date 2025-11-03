import { PartialType } from '@nestjs/mapped-types';
import { CreateGiangVienDto } from './create-giang-vien.dto';
import { IsString } from 'class-validator/types/decorator/typechecker/IsString';
import { IsDate } from 'class-validator';

export class UpdateGiangVienDto extends PartialType(CreateGiangVienDto) {
    @IsString()
    hoTen: string;
    @IsString()
    soDienThoai: string;

    @IsDate()
    ngaySinh: Date;

    @IsString()
    matKhau: string;

    @IsString()
    chucVu: string;

}

import { PartialType } from '@nestjs/mapped-types';
import { CreateNguoiDungDto } from './create-nguoi-dung.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateNguoiDungDto /**extends PartialType(CreateNguoiDungDto)**/ {
    @IsOptional()
    @IsString()
    hoTen?: string

    @IsOptional()
    @IsString()
    soDienThoai?: string

    @IsOptional()
    @IsString()
    anhDaiDien?: string

    @IsString()
    @IsOptional()
    ngaySinh?: string

}

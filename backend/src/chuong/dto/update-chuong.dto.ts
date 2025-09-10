import { PartialType } from '@nestjs/mapped-types';
import { CreateChuongDto } from './create-chuong.dto';

export class UpdateChuongDto extends PartialType(CreateChuongDto) //tất cả các trường của insert thành IsOptional() nghĩa là có cugn4 được hoặc không
{}

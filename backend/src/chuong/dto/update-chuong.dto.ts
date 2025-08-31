import { PartialType } from '@nestjs/mapped-types';
import { CreateChuongDto } from './create-chuong.dto';

export class UpdateChuongDto extends PartialType(CreateChuongDto) {}

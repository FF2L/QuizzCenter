import { PartialType } from '@nestjs/mapped-types';
import { CreateGiangVienDto } from './create-giang-vien.dto';

export class UpdateGiangVienDto extends PartialType(CreateGiangVienDto) {}

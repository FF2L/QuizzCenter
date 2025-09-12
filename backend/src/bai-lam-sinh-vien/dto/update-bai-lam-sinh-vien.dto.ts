import { PartialType } from '@nestjs/mapped-types';
import { CreateBaiLamSinhVienDto } from './create-bai-lam-sinh-vien.dto';

export class UpdateBaiLamSinhVienDto extends PartialType(CreateBaiLamSinhVienDto) {}

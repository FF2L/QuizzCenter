import { IsEnum, IsOptional, isString, IsString } from 'class-validator';
import { IntersectionType } from '@nestjs/mapped-types';
import { Pagination } from 'src/common/dto/pagination.dto';
import { DoKho } from 'src/common/enum/dokho.enum';
import { LoaiCauHoi } from 'src/common/enum/loaicauhoi.enum';

class filterLopHocPhanSinhVien {
  @IsOptional()
  @IsString()
  tenMonHoc?: string;

  @IsOptional() 
  @IsString()
  maMonHoc?: string;
}

export class FilterLopHocPhanSinhVienDto extends IntersectionType(
  Pagination,
  filterLopHocPhanSinhVien
) {}

import { IsEnum, IsOptional } from 'class-validator';
import { IntersectionType } from '@nestjs/mapped-types';
import { Pagination } from 'src/common/dto/pagination.dto';
import { DoKho } from 'src/common/enum/dokho.enum';
import { LoaiCauHoi } from 'src/common/enum/loaicauhoi.enum';

class CauHoiFilterDto {
  @IsOptional()
  @IsEnum(LoaiCauHoi, {
    message: 'loaiCauHoi phải là một trong các giá trị: ' + Object.values(LoaiCauHoi).join(', ')
    })
  loaiCauHoi?: LoaiCauHoi;

  @IsOptional() 
  @IsEnum(DoKho, {
        message: 'doKho phải là một trong các giá trị: ' + Object.values(LoaiCauHoi).join(', ')
    })
  doKho?: DoKho;
}

export class FilterCauHoiQueryDto extends IntersectionType(
  Pagination,
  CauHoiFilterDto,
) {}

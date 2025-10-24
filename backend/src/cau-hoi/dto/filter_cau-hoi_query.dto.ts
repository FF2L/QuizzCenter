import { IsEnum, IsOptional } from 'class-validator';
import { IntersectionType } from '@nestjs/mapped-types';
import { Pagination } from 'src/common/dto/pagination.dto';
import { DoKho } from 'src/common/enum/dokho.enum';
import { LoaiCauHoi } from 'src/common/enum/loaicauhoi.enum';

class CauHoiFilterDto {

  @IsOptional() 
  @IsEnum(DoKho, {
        message: 'doKho phải là một trong các giá trị: ' + Object.values(DoKho).join(', ')
    })
  doKho?: DoKho;
}

export class FilterCauHoiQueryDto extends IntersectionType(
  Pagination,
  CauHoiFilterDto,
) {}

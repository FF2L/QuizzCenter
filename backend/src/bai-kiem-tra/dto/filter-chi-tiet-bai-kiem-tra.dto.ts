import { IntersectionType } from "@nestjs/mapped-types";
import { IsBoolean, IsEnum, IsOptional } from "class-validator";
import { Pagination } from "src/common/dto/pagination.dto";
import { LoaiKiemTra } from "src/common/enum/loaiKiemTra.enum";

class ChiTietBaiKiemTraFilterDto{
        @IsOptional()
        @IsEnum( LoaiKiemTra, {message: 'loaiCauHoi phải là một trong các giá trị: ' + Object.values(LoaiKiemTra).join(', ')})
        loaiKiemTra?: LoaiKiemTra

        @IsOptional()
        @IsBoolean()
        xemBaiLam: boolean

        @IsOptional()
        @IsBoolean()
        hienThiKetQua: boolean
}

export class FilterChiTietBaiKiemTraDto extends IntersectionType(
  Pagination,
  ChiTietBaiKiemTraFilterDto,
) {}

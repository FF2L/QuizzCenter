import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateChiTietCauHoiDto {
  @IsNumber()
  idCauHoiBaiKiemTra: number;

  @IsArray()
  @IsNumber({}, { each: true })
  mangIdDapAn: number[];
}

export class UpdateDanhSachChiTietDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateChiTietCauHoiDto)
  danhSach: UpdateChiTietCauHoiDto[];
}

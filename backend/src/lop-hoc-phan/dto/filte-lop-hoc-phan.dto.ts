import { IsNumber, IsOptional, IsPositive } from "class-validator";


export class FilterLopHocPhanQueryDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  idGiangVien?: number;

}

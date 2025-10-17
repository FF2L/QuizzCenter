import { IsDate, IsNumber } from "class-validator";

export class CreateBaiLamSinhVienDto {
    @IsNumber()
    idBaiKiemTra: number;

}

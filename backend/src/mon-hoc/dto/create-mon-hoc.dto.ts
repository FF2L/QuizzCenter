import { IsString } from "class-validator";

export class CreateMonHocDto {
    @IsString()
    maMonHoc: string;
    @IsString()
    tenMonHoc: string;
}

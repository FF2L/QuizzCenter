import { PartialType } from '@nestjs/mapped-types';
import { CreateMonHocDto } from './create-mon-hoc.dto';
import { IsString } from 'class-validator';

export class UpdateMonHocDto  {

    @IsString()
    maMonHoc: string;

    @IsString()
    tenMonHoc: string;

}

import { PartialType } from '@nestjs/mapped-types';
import { CreateBaiKiemTraDto } from './create-bai-kiem-tra.dto';

export class UpdateBaiKiemTraDto extends PartialType(CreateBaiKiemTraDto) {}

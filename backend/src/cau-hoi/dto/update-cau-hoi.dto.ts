import { PartialType } from '@nestjs/mapped-types';
import { CreateCauHoiDto } from './create-cau-hoi.dto';

export class UpdateCauHoiDto extends PartialType(CreateCauHoiDto) {}

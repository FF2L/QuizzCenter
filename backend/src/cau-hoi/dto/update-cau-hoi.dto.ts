import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateCauHoiDto } from './create-cau-hoi.dto';

export class UpdateCauHoiDto extends PartialType(OmitType(CreateCauHoiDto, ['loaiCauHoi'] as const,)) {
    
}

import { PartialType } from '@nestjs/mapped-types';
import { CreateThongBaoDto } from './create-thong-bao.dto';

export class UpdateThongBaoDto extends PartialType(CreateThongBaoDto) {}

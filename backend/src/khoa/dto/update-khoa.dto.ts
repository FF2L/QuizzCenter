import { PartialType } from '@nestjs/mapped-types';
import { CreateKhoaDto } from './create-khoa.dto';

export class UpdateKhoaDto extends PartialType(CreateKhoaDto) {}

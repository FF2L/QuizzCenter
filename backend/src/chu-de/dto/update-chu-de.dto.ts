import { PartialType } from '@nestjs/mapped-types';
import { CreateChuDeDto } from './create-chu-de.dto';

export class UpdateChuDeDto extends PartialType(CreateChuDeDto) {}

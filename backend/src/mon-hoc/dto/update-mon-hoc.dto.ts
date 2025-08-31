import { PartialType } from '@nestjs/mapped-types';
import { CreateMonHocDto } from './create-mon-hoc.dto';

export class UpdateMonHocDto extends PartialType(CreateMonHocDto) {}

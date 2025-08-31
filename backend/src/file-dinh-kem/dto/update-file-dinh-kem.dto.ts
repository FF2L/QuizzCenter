import { PartialType } from '@nestjs/mapped-types';
import { CreateFileDinhKemDto } from './create-file-dinh-kem.dto';

export class UpdateFileDinhKemDto extends PartialType(CreateFileDinhKemDto) {}

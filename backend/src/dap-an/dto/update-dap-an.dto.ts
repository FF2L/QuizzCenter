import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateDapAnDto } from './create-dap-an.dto';
import { CreateMotDapAn } from './create-mot-dap-an.dto';

export class UpdateDapAnDto extends PartialType(OmitType(CreateMotDapAn, ['idCauHoi'] as const,)) {}

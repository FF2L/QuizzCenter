import { PartialType } from '@nestjs/mapped-types';
import { CreateDapAnDto } from './create-dap-an.dto';

export class UpdateDapAnDto extends PartialType(CreateDapAnDto) {}

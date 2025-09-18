import { PartialType } from '@nestjs/mapped-types';
import { CreateGuiFileDto } from './create-gui-file.dto';

export class UpdateGuiFileDto extends PartialType(CreateGuiFileDto) {}

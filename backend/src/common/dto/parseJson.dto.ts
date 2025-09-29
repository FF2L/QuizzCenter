// common/pipes/parse-json.pipe.ts
import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseJsonPipe implements PipeTransform<string, any> {
  transform(value: string) {
    if (!value) return undefined;
    try {
      return JSON.parse(value);  
    } catch {
      throw new BadRequestException('createCauHoi phải là JSON hợp lệ');
    }
  }
}

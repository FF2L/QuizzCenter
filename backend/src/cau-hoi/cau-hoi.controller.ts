import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseInterceptors, BadRequestException, UploadedFiles } from '@nestjs/common';
import { CauHoiService } from './cau-hoi.service';
import { CreateCauHoiDto } from './dto/create-cau-hoi.dto';
import { UpdateCauHoiDto } from './dto/update-cau-hoi.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ACCEPTED_MIME_IMG, MAX_IMAGE_SIZE } from 'src/common/utiils/const.globals';
import { ImgFile } from 'src/common/utiils/types.globals';
import { ParseJsonPipe } from 'src/common/dto/parseJson.dto';
import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Controller('cau-hoi')
export class CauHoiController {
  constructor(private readonly cauHoiService: CauHoiService) {}

  @Post()
  @UseInterceptors(
  FilesInterceptor('files', 10, { // tối đa 10 file, tuỳ chỉnh
    storage: memoryStorage(),
    limits: { fileSize: MAX_IMAGE_SIZE },
  }),
)
  async create(
  @Body('createCauHoi', new ParseJsonPipe()) createCauHoiDto: any , //sau này sửa lại createCauHoiDto
   @UploadedFiles() files?: Express.Multer.File[]) {

      // 2) transform -> instance DTO (ép kiểu ngầm)
    const dto = plainToInstance(CreateCauHoiDto, createCauHoiDto, { enableImplicitConversion: true });

    // 3) validate thủ công 
    const errors = validateSync(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    if (errors.length) {
      // ném lỗi ValidationPipe
      throw new BadRequestException(errors);
    }

     // (tuỳ chọn) validate nếu có file
    if (files?.length) {
    
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (!ACCEPTED_MIME_IMG.includes(f.mimetype)) {
          throw new BadRequestException(`File #${i} MIME không hợp lệ: ${f.mimetype}`);
        }
        if ((f.size || 0) > MAX_IMAGE_SIZE) {
          throw new BadRequestException(`File #${i} vượt quá dung lượng cho phép`);
        }
      }
    }
    
    const mangFile: ImgFile[] | undefined = files?.length ? files.map(f => ({buffer: f.buffer, originalname: f.originalname, mimetype: f.mimetype})) 
      : undefined
    return await this.cauHoiService.taoMotCauHoi(createCauHoiDto, mangFile);
  }

  @Get()
  findAll() {
    return this.cauHoiService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id',ParseIntPipe) id: number) {
    return await this.cauHoiService.timCauHoiTheoId(id);
  }

  @Patch(':id')
  @UseInterceptors(
  FilesInterceptor('files', 10, { // tối đa 10 file, tuỳ chỉnh
    storage: memoryStorage(),
    limits: { fileSize: MAX_IMAGE_SIZE },
  }),
)
  async update(@Param('id',ParseIntPipe) id: number, @Body('updateCauHoi', new ParseJsonPipe()) updateCauHoiDto: any, @UploadedFiles() files?: Express.Multer.File[]) {
         // 2) transform -> instance DTO (ép kiểu ngầm)
         console.log("👉 updateCauHoiDto nhận được:", updateCauHoiDto);

    const dto = plainToInstance(UpdateCauHoiDto, updateCauHoiDto, { enableImplicitConversion: true });

    // 3) validate thủ công 
    const errors = validateSync(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
    if (errors.length) {
      // ném lỗi ValidationPipe
      throw new BadRequestException(errors);
    }

     // (tuỳ chọn) validate nếu có file
    if (files?.length) {
    
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (!ACCEPTED_MIME_IMG.includes(f.mimetype)) {
          throw new BadRequestException(`File #${i} MIME không hợp lệ: ${f.mimetype}`);
        }
        if ((f.size || 0) > MAX_IMAGE_SIZE) {
          throw new BadRequestException(`File #${i} vượt quá dung lượng cho phép`);
        }
      }
    }
    
    const mangFile: ImgFile[] | undefined = files?.length ? files.map(f => ({buffer: f.buffer, originalname: f.originalname, mimetype: f.mimetype})) 
      : undefined

    return await this.cauHoiService.capNhatCauHoi(id, updateCauHoiDto, mangFile);
  }

  @Delete(':id')
  async remove(@Param('id',ParseIntPipe) id: number) {
    console.log(id)
    return await this.cauHoiService.remove(id);
  }
}

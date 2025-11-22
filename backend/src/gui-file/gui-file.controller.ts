import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, BadRequestException, UploadedFile, ParseIntPipe } from '@nestjs/common';
import { GuiFileService } from './gui-file.service';
import { CreateGuiFileDto } from './dto/create-gui-file.dto';
import { UpdateGuiFileDto } from './dto/update-gui-file.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ACCEPTED_MIME_EXCEL } from 'src/common/utiils/const.globals';

@Controller('gui-file')
export class GuiFileController {
  constructor(private readonly guiFileService: GuiFileService) {}

@Post('import/:idChuong')
@UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }))
async import(
  @UploadedFile() file: Express.Multer.File,
  @Param('idChuong') idChuong: number,
) {
  if (!file) throw new BadRequestException('Thiếu file');
  return this.guiFileService.parseFileFormat(file.buffer, file.originalname, +idChuong);
}


  @Post('anh')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMotAnh(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Chưa chọn file!');
    const publicId = await this.guiFileService.uploadMotAnh(file);
    return { publicId };     // <=== trả về đúng yêu cầu
  }

  @Delete('anh/')
  async xoaMotAnh(@Body('publicId') publicId: string) {
    await this.guiFileService.xoaAnhTheoId(publicId);
    return { ok: true };
  }

}

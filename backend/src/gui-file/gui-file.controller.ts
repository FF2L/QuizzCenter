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

  @Post('cau-hoi/:idChuong')
  @UseInterceptors(
    FileInterceptor('file',{
      storage: memoryStorage(),
      limits: {fileSize: 20 * 1024 *1024}, //Tối đã 20 MB
      fileFilter: (_req,file,cb) =>{
        if(ACCEPTED_MIME_EXCEL.has(file.mimetype) || file.originalname.endsWith('.xlsx') || file.originalname.endsWith('.csv')){
          cb(null,true)
        } else {
          cb(new BadRequestException('Chỉ chấp nhận file có đuôi .xlsx hoặc .csv'), false)
        }
      }
    })
  )
  async taoCauHoiTuFile( @Param('idChuong', ParseIntPipe) idChuong: number,
    @UploadedFile() file: Express.Multer.File) {
    if(!file) throw new BadRequestException('thiếu file hoặc file name = "file"')
      // .xlsx → parseXlsx; .csv → parseCsv
      const ext = (file.originalname.split('.').pop() || '').toLowerCase()
      const rows = ext === 'csv' ?
      await this.guiFileService.parseCsv(file.buffer) :
      await this.guiFileService.parseXlsx(file.buffer)

      // Chuyển sang cấu trúc chuẩn rồi insert DB
    const normalized = this.guiFileService.normalizeRows(rows);
    const result = await this.guiFileService.saveToDatabase(normalized, idChuong);
    return { ok: true, idChuong, ...result };
  }

  @Get()
  findAll() {
    return this.guiFileService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.guiFileService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGuiFileDto: UpdateGuiFileDto) {
    return this.guiFileService.update(+id, updateGuiFileDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.guiFileService.remove(+id);
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { GuiFileController } from './gui-file.controller';
import { GuiFileService } from './gui-file.service';

describe('GuiFileController', () => {
  let controller: GuiFileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuiFileController],
      providers: [GuiFileService],
    }).compile();

    controller = module.get<GuiFileController>(GuiFileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { GuiFileService } from './gui-file.service';

describe('GuiFileService', () => {
  let service: GuiFileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GuiFileService],
    }).compile();

    service = module.get<GuiFileService>(GuiFileService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

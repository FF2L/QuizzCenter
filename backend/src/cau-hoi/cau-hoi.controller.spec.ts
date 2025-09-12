import { Test, TestingModule } from '@nestjs/testing';
import { CauHoiController } from './cau-hoi.controller';
import { CauHoiService } from './cau-hoi.service';

describe('CauHoiController', () => {
  let controller: CauHoiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CauHoiController],
      providers: [CauHoiService],
    }).compile();

    controller = module.get<CauHoiController>(CauHoiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

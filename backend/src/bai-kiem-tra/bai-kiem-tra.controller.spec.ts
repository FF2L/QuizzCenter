import { Test, TestingModule } from '@nestjs/testing';
import { BaiKiemTraController } from './bai-kiem-tra.controller';
import { BaiKiemTraService } from './bai-kiem-tra.service';

describe('BaiKiemTraController', () => {
  let controller: BaiKiemTraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BaiKiemTraController],
      providers: [BaiKiemTraService],
    }).compile();

    controller = module.get<BaiKiemTraController>(BaiKiemTraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

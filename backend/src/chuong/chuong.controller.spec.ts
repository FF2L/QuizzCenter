import { Test, TestingModule } from '@nestjs/testing';
import { ChuongController } from './chuong.controller';
import { ChuongService } from './chuong.service';

describe('ChuongController', () => {
  let controller: ChuongController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChuongController],
      providers: [ChuongService],
    }).compile();

    controller = module.get<ChuongController>(ChuongController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

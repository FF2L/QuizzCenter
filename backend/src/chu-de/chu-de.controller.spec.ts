import { Test, TestingModule } from '@nestjs/testing';
import { ChuDeController } from './chu-de.controller';
import { ChuDeService } from './chu-de.service';

describe('ChuDeController', () => {
  let controller: ChuDeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChuDeController],
      providers: [ChuDeService],
    }).compile();

    controller = module.get<ChuDeController>(ChuDeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { DapAnController } from './dap-an.controller';
import { DapAnService } from './dap-an.service';

describe('DapAnController', () => {
  let controller: DapAnController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DapAnController],
      providers: [DapAnService],
    }).compile();

    controller = module.get<DapAnController>(DapAnController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

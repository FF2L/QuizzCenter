import { Test, TestingModule } from '@nestjs/testing';
import { DapAnService } from './dap-an.service';

describe('DapAnService', () => {
  let service: DapAnService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DapAnService],
    }).compile();

    service = module.get<DapAnService>(DapAnService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

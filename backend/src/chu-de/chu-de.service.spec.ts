import { Test, TestingModule } from '@nestjs/testing';
import { ChuDeService } from './chu-de.service';

describe('ChuDeService', () => {
  let service: ChuDeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChuDeService],
    }).compile();

    service = module.get<ChuDeService>(ChuDeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

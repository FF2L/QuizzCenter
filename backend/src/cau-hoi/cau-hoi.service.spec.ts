import { Test, TestingModule } from '@nestjs/testing';
import { CauHoiService } from './cau-hoi.service';

describe('CauHoiService', () => {
  let service: CauHoiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CauHoiService],
    }).compile();

    service = module.get<CauHoiService>(CauHoiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

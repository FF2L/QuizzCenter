import { Test, TestingModule } from '@nestjs/testing';
import { BaiKiemTraService } from './bai-kiem-tra.service';

describe('BaiKiemTraService', () => {
  let service: BaiKiemTraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BaiKiemTraService],
    }).compile();

    service = module.get<BaiKiemTraService>(BaiKiemTraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

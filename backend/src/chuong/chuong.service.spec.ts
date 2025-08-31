import { Test, TestingModule } from '@nestjs/testing';
import { ChuongService } from './chuong.service';

describe('ChuongService', () => {
  let service: ChuongService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChuongService],
    }).compile();

    service = module.get<ChuongService>(ChuongService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

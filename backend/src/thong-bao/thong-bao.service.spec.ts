import { Test, TestingModule } from '@nestjs/testing';
import { ThongBaoService } from './thong-bao.service';

describe('ThongBaoService', () => {
  let service: ThongBaoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ThongBaoService],
    }).compile();

    service = module.get<ThongBaoService>(ThongBaoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

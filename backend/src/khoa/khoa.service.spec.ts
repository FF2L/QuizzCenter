import { Test, TestingModule } from '@nestjs/testing';
import { KhoaService } from './khoa.service';

describe('KhoaService', () => {
  let service: KhoaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KhoaService],
    }).compile();

    service = module.get<KhoaService>(KhoaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

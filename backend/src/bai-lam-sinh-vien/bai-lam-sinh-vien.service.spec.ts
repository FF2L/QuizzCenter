import { Test, TestingModule } from '@nestjs/testing';
import { BaiLamSinhVienService } from './bai-lam-sinh-vien.service';

describe('BaiLamSinhVienService', () => {
  let service: BaiLamSinhVienService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BaiLamSinhVienService],
    }).compile();

    service = module.get<BaiLamSinhVienService>(BaiLamSinhVienService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

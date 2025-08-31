import { Test, TestingModule } from '@nestjs/testing';
import { GiangVienService } from './giang-vien.service';

describe('GiangVienService', () => {
  let service: GiangVienService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GiangVienService],
    }).compile();

    service = module.get<GiangVienService>(GiangVienService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { FileDinhKemService } from './file-dinh-kem.service';

describe('FileDinhKemService', () => {
  let service: FileDinhKemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileDinhKemService],
    }).compile();

    service = module.get<FileDinhKemService>(FileDinhKemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

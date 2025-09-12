import { Test, TestingModule } from '@nestjs/testing';
import { MonHocService } from './mon-hoc.service';

describe('MonHocService', () => {
  let service: MonHocService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MonHocService],
    }).compile();

    service = module.get<MonHocService>(MonHocService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

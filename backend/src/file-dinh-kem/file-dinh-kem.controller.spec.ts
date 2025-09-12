import { Test, TestingModule } from '@nestjs/testing';
import { FileDinhKemController } from './file-dinh-kem.controller';
import { FileDinhKemService } from './file-dinh-kem.service';

describe('FileDinhKemController', () => {
  let controller: FileDinhKemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FileDinhKemController],
      providers: [FileDinhKemService],
    }).compile();

    controller = module.get<FileDinhKemController>(FileDinhKemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

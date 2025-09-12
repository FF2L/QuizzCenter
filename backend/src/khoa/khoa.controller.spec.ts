import { Test, TestingModule } from '@nestjs/testing';
import { KhoaController } from './khoa.controller';
import { KhoaService } from './khoa.service';

describe('KhoaController', () => {
  let controller: KhoaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KhoaController],
      providers: [KhoaService],
    }).compile();

    controller = module.get<KhoaController>(KhoaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

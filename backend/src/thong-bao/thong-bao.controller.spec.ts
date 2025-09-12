import { Test, TestingModule } from '@nestjs/testing';
import { ThongBaoController } from './thong-bao.controller';
import { ThongBaoService } from './thong-bao.service';

describe('ThongBaoController', () => {
  let controller: ThongBaoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ThongBaoController],
      providers: [ThongBaoService],
    }).compile();

    controller = module.get<ThongBaoController>(ThongBaoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

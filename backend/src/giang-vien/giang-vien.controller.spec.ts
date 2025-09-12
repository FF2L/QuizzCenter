import { Test, TestingModule } from '@nestjs/testing';
import { GiangVienController } from './giang-vien.controller';
import { GiangVienService } from './giang-vien.service';

describe('GiangVienController', () => {
  let controller: GiangVienController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GiangVienController],
      providers: [GiangVienService],
    }).compile();

    controller = module.get<GiangVienController>(GiangVienController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

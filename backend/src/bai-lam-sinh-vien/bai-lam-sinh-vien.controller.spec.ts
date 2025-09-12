import { Test, TestingModule } from '@nestjs/testing';
import { BaiLamSinhVienController } from './bai-lam-sinh-vien.controller';
import { BaiLamSinhVienService } from './bai-lam-sinh-vien.service';

describe('BaiLamSinhVienController', () => {
  let controller: BaiLamSinhVienController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BaiLamSinhVienController],
      providers: [BaiLamSinhVienService],
    }).compile();

    controller = module.get<BaiLamSinhVienController>(BaiLamSinhVienController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

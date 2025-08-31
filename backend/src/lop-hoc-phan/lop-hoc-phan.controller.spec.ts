import { Test, TestingModule } from '@nestjs/testing';
import { LopHocPhanController } from './lop-hoc-phan.controller';
import { LopHocPhanService } from './lop-hoc-phan.service';

describe('LopHocPhanController', () => {
  let controller: LopHocPhanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LopHocPhanController],
      providers: [LopHocPhanService],
    }).compile();

    controller = module.get<LopHocPhanController>(LopHocPhanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

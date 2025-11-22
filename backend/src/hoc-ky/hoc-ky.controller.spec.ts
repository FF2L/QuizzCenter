import { Test, TestingModule } from '@nestjs/testing';
import { HocKyController } from './hoc-ky.controller';
import { HocKyService } from './hoc-ky.service';

describe('HocKyController', () => {
  let controller: HocKyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HocKyController],
      providers: [HocKyService],
    }).compile();

    controller = module.get<HocKyController>(HocKyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

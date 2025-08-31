import { Test, TestingModule } from '@nestjs/testing';
import { MonHocController } from './mon-hoc.controller';
import { MonHocService } from './mon-hoc.service';

describe('MonHocController', () => {
  let controller: MonHocController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MonHocController],
      providers: [MonHocService],
    }).compile();

    controller = module.get<MonHocController>(MonHocController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

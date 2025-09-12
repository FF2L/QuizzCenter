import { RefeshJwtAuthGuard } from './refesh-jwt-auth.guard';

describe('RefeshJwtAuthGuard', () => {
  it('should be defined', () => {
    expect(new RefeshJwtAuthGuard()).toBeDefined();
  });
});

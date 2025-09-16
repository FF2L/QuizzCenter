import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

<<<<<<< HEAD
  app.enableCors(); // ← thêm dòng này để cho phép frontend khác port fetch
=======
  app.enableCors();
>>>>>>> c9c3fe3 (sử lại lay tất ca)

  await app.listen(process.env.PORT ?? 3000);
};
bootstrap();

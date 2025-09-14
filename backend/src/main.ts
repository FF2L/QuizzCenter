import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors(); // ← thêm dòng này để cho phép frontend khác port fetch

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

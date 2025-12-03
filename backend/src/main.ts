import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
  origin: [
    "https://chat.fff3l.click",    // FE của bạn
    "https://quizz.fff3l.click", // quizzcenter
    "http://localhost:5000",        // nếu bạn còn dev local
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
});


  await app.listen(process.env.PORT ?? 3000);
};
bootstrap();

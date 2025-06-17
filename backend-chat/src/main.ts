import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = Array.from(
    { length: 11 },
    (_, i) => `http://localhost:${3000 + i}`,
  );

  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  };

  app.enableCors(corsOptions);

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(5000, '0.0.0.0');
  console.log(`🚀 Server running on http://localhost:5000`);
}
bootstrap();

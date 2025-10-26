import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

  app.enableCors({
    origin: true,
    credentials: false,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
  });

  await app.listen(process.env.PORT ?? 3000);

  console.log(`Application is running on: ${await app.getUrl()}`);
}
void bootstrap();
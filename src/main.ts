import process from 'node:process';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { config as dotenvConfig } from 'dotenv';
import { AppModule } from './app.module';

dotenvConfig();

const SERVICE_NAME = 'TechRun-Server';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger(SERVICE_NAME);

  const documentConfig = new DocumentBuilder()
    .setTitle(SERVICE_NAME)
    .setDescription(`Documentation for ${SERVICE_NAME}`)
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, documentConfig);

  app.use(
    '/swagger',
    apiReference({
      content: document,
    }),
  );

  const host = process.env.HOST ?? '0.0.0.0';
  const port = process.env.PORT ?? 5001;
  await app.listen(port, host);
  logger.log(`Server is running at http://${host}:${port}`);
  logger.log(`Swagger documentation available at http://${host}:${port}/swagger`);
}

void bootstrap();

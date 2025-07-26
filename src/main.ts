import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { config as dotenvConfig } from 'dotenv';
import configuration from '@/common/config/configuration';
import { AppModule } from './app.module';

dotenvConfig();

const SERVICE_NAME = 'TechRun-Server';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger(SERVICE_NAME);

  // Add CORS
  // Allow all origins, methods, and headers
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });

  app.setGlobalPrefix('api');

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

  await app.listen(configuration().port, configuration().host);
  logger.log(`Server is running at http://${configuration().host}:${configuration().port}`);
  logger.log(`Swagger documentation available at http://${configuration().host}:${configuration().port}/swagger`);
  logger.log(`MongoDB URI: ${configuration().mongodbUri}`);
}

void bootstrap();

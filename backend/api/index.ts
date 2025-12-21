import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express, { Request, Response } from 'express';
import { AppModule } from '../src/app.module';
import { CustomLogger } from '../src/common/services';
import { RuntimeExceptionFilter } from '../src/middlewares';
import { config } from 'dotenv';

// Load environment variables
config();

const expressApp = express();

let cachedApp: express.Express | null = null;

async function bootstrap(): Promise<express.Express> {
  if (cachedApp) {
    return cachedApp;
  }

  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp), {
    logger: ['log', 'error', 'warn'],
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Logger and filters
  app.useLogger(app.get(CustomLogger));
  app.useGlobalFilters(new RuntimeExceptionFilter(app.get(CustomLogger)));

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger
  const options = new DocumentBuilder()
    .setTitle('NestJS API Documentation')
    .setDescription('API for phone-based OTP authentication')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/api/swagger', app, document);

  await app.init();

  cachedApp = expressApp;
  return cachedApp;
}

// Vercel serverless handler
export default async function handler(req: Request, res: Response) {
  const app = await bootstrap();
  
  // Handle root path
  if (req.url === '/' || req.url === '') {
    return res.status(200).json({
      message: 'Welcome to NestJS API',
      docs: '/api/swagger',
      health: '/api/health',
    });
  }

  app(req, res);
}


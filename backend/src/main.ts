import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CustomLogger, NetworkService } from './common/services';
import { RuntimeExceptionFilter } from './middlewares';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Response } from 'express';
import { config } from 'dotenv';
import { initializeDatabase } from './database';

// Load environment variables first
config();

const logger = new Logger('Bootstrap');

let cachedApp: NestExpressApplication | null = null;

async function bootstrap(): Promise<NestExpressApplication> {
  // Return cached app for serverless warm starts
  if (cachedApp) {
    return cachedApp;
  }

  // Check for DATABASE_URL before doing anything
  if (!process.env.DATABASE_URL) {
    logger.error('═══════════════════════════════════════════════════════════');
    logger.error('  FATAL ERROR: DATABASE_URL is not defined!');
    logger.error('═══════════════════════════════════════════════════════════');
    logger.error('');
    logger.error('  Please create a .env file with DATABASE_URL configured.');
    logger.error('  Example:');
    logger.error(
      '  DATABASE_URL="postgresql://postgres:password@localhost:5432/nestjs_starter"',
    );
    logger.error('');
    logger.error('═══════════════════════════════════════════════════════════');
    process.exit(1);
  }

  try {
    // Initialize database (create DB if it doesn't exist)
    logger.log('Initializing database...');
    await initializeDatabase();
    logger.log('Database ready!');
  } catch (error) {
    logger.error('═══════════════════════════════════════════════════════════');
    logger.error('  FATAL ERROR: Database initialization failed!');
    logger.error('═══════════════════════════════════════════════════════════');
    logger.error('');
    logger.error(`  Error: ${error instanceof Error ? error.message : error}`);
    logger.error('');
    logger.error('  Please check:');
    logger.error('  1. PostgreSQL is running');
    logger.error('  2. DATABASE_URL credentials are correct');
    logger.error('  3. Network connection to database host');
    logger.error('');
    logger.error('═══════════════════════════════════════════════════════════');
    process.exit(1);
  }

  // Create NestJS application
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['log', 'error', 'warn'],
  });

  app.setGlobalPrefix('api');

  const corsOptions: CorsOptions = {
    origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  };
  app.enableCors(corsOptions);

  app.useLogger(app.get(CustomLogger));

  app.useGlobalFilters(new RuntimeExceptionFilter(app.get(CustomLogger)));

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const options = new DocumentBuilder()
    .setTitle('NestJS Starter API Documentation')
    .setDescription('API for phone-based OTP authentication')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('/api/swagger', app, document);

  // Welcome page for the root URL
  app.getHttpAdapter().get('/', (req, res: Response) => {
    res.status(200).json({
      message: 'Welcome to NestJS API',
      docs: '/api/swagger',
      health: '/api',
    });
  });

  await app.init();
  cachedApp = app;
  
  return app;
}

// Check if running on Vercel (serverless)
if (process.env.VERCEL) {
  // Serverless mode - export handler
  bootstrap().then((app) => {
    const expressApp = app.getHttpAdapter().getInstance();
    module.exports = expressApp;
  });
} else {
  // Local development - start server
  bootstrap().then((app) => {
    const PORT = parseInt(process.env.PORT) || 4000;
    app.listen(PORT, '0.0.0.0').then(() => {
      NetworkService.logServerUrls(PORT, logger);
    });
  });
}

// Export for Vercel
export default async function handler(req: any, res: any) {
  const app = await bootstrap();
  const expressApp = app.getHttpAdapter().getInstance();
  return expressApp(req, res);
}

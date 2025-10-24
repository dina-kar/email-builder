import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/filters/http-exception.filter';
import { NextFunction, Request, Response } from 'express';
import * as bodyParser from 'body-parser';

let cachedServer: (req: Request, res: Response, next: NextFunction) => void;

/**
 * Bootstrap NestJS application for serverless environment
 */
async function bootstrapServer(): Promise<(req: Request, res: Response, next: NextFunction) => void> {
  const logger = new Logger('ServerlessBootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Increase payload size limit for large template data (50MB)
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  // Enable CORS
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Set global prefix
  app.setGlobalPrefix('api');

  // Initialize app without listening
  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  logger.log('NestJS application initialized for serverless');

  return expressApp;
}

/**
 * Vercel serverless handler
 * Caches the NestJS application instance across cold starts
 */
export default async function handler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // Initialize server only once (cold start optimization)
    if (!cachedServer) {
      const server = await bootstrapServer();
      cachedServer = server;
    }

    // Route request to cached server
    cachedServer(req, res, next);
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({
      statusCode: 500,
      message: 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

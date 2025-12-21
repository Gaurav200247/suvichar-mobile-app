import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomLogger } from 'src/common/services';

@Injectable()
export class APIUrlLoggerMiddleware implements NestMiddleware {
  private logger = new CustomLogger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();

    // Log incoming request
    this.logger.log(`📥 Request - [${timestamp}] - ${req.method} ${req.originalUrl}`);

    // Log request body for POST/PUT/PATCH (excluding sensitive fields)
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      const sanitizedBody = this.sanitizeBody(req.body);
      this.logger.log(`   Body: ${JSON.stringify(sanitizedBody)}`);
    }

    // Log query params if present
    if (Object.keys(req.query).length > 0) {
      this.logger.log(`   Query: ${JSON.stringify(req.query)}`);
    }

    // Capture response
    const originalSend = res.send.bind(res);
    res.send = (body: any) => {
      const duration = Date.now() - startTime;
      const responseTimestamp = new Date().toISOString();

      // Log response
      this.logger.log(
        `📤 Response - [${responseTimestamp}] - ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`,
      );

      return originalSend(body);
    };

    next();
  }

  // Sanitize sensitive fields from logs
  private sanitizeBody(body: any): any {
    const sensitiveFields = ['password', 'otp', 'token', 'accessToken', 'profileImage'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}

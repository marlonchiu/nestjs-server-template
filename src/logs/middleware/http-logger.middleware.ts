import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LogsService } from '../logs.service';

/**
 * 请求追踪中间件
 * 为每个请求生成唯一的追踪 ID，并记录请求开始信息
 */
@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(HttpLoggerMiddleware.name);

  constructor(private logsService: LogsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // 生成或获取请求追踪 ID
    const requestId = (req.headers['x-request-id'] as string) || this.generateRequestId();
    const correlationId = (req.headers['x-correlation-id'] as string) || requestId;

    // 将追踪 ID 添加到请求对象
    (req as any).requestId = requestId;
    (req as any).correlationId = correlationId;

    // 设置响应头
    res.setHeader('X-Request-ID', requestId);
    res.setHeader('X-Correlation-ID', correlationId);

    // 记录请求开始
    const { method, url, ip, headers } = req;
    const userAgent = headers['user-agent'] || '';
    const userId = (req as any).user?.id;

    this.logger.log(
      `Incoming Request: ${method} ${url} - IP: ${ip} - RequestID: ${requestId}`,
    );

    // 记录更详细的请求信息
    this.logsService.log(
      {
        type: 'request_start',
        method,
        url,
        ip,
        userAgent,
        requestId,
        correlationId,
        userId,
        query: req.query,
        headers: this.sanitizeHeaders(headers),
      },
      { requestId, correlationId },
    );

    // 记录请求开始时间
    (req as any).startTime = Date.now();

    next();
  }

  /**
   * 生成唯一的请求 ID
   */
  private generateRequestId(): string {
    // 使用时间戳 + 随机数生成请求 ID
    return `req-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * 清理敏感头部信息
   */
  private sanitizeHeaders(headers: Record<string, any>): Record<string, any> {
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    const sanitized = { ...headers };

    sensitiveHeaders.forEach((header) => {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}

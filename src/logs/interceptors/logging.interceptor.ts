import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { LogsService } from '../logs.service';

/**
 * 请求日志拦截器
 * 记录每个 HTTP 请求的详细信息和响应时间
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private logsService: LogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const requestId = headers['x-request-id'] as string;
    const userId = (request as any).user?.id as string | undefined;
    const clientIp = ip || 'unknown';

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode;
          const responseTime = Date.now() - startTime;

          // 使用自定义日志服务记录访问日志
          this.logsService.logHttpAccess(
            method,
            url,
            statusCode,
            responseTime,
            clientIp,
            userAgent,
            requestId,
            userId,
          );
        },
        error: (error: any) => {
          const response = context.switchToHttp().getResponse();
          const statusCode = response.statusCode || 500;
          const responseTime = Date.now() - startTime;
          const errorMessage = error.message || 'Unknown error';

          // 记录错误日志
          this.logsService.logHttpError(
            method,
            url,
            statusCode,
            errorMessage,
            clientIp,
            userAgent,
            requestId,
            responseTime,
          );
        },
      }),
    );
  }
}

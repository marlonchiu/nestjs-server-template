import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Request } from 'express';
import { LogsService } from '../logs.service';

/**
 * 错误日志拦截器
 * 捕获并记录处理过程中的错误信息
 */
@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorInterceptor.name);

  constructor(private logsService: LogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const requestId = headers['x-request-id'] as string;
    const clientIp = ip || 'unknown';

    return next.handle().pipe(
      catchError((error: any) => {
        const statusCode = error.status || error.statusCode || 500;
        const errorMessage = error.message || 'Internal server error';
        const errorStack = error.stack;

        // 记录详细错误日志
        this.logsService.error(errorMessage, errorStack, {
          type: 'error_interceptor',
          method,
          url,
          statusCode,
          ip: clientIp,
          userAgent,
          requestId,
        });

        // 开发环境打印详细错误
        if (process.env.NODE_ENV !== 'production') {
          this.logger.error(
            `Error: ${errorMessage}, Stack: ${errorStack}`,
          );
        }

        // 重新抛出原始错误
        return throwError(() => error);
      }),
    );
  }
}

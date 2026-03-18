import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | object;
    let errorDetail: string | undefined;

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message || res;
    } else {
      // 非 HTTP 异常，记录详细错误信息
      message = '服务器内部错误';
      errorDetail = exception instanceof Error ? exception.message : String(exception);
    }

    // 记录错误日志
    this.logError(status, request, errorDetail);

    // 生产环境隐藏内部错误详情
    const isProduction = process.env.NODE_ENV === 'production';
    const responseMessage = isProduction && errorDetail ? message : message;

    response.status(status).json({
      success: false,
      error: typeof responseMessage === 'string' ? responseMessage : (responseMessage as any).message || responseMessage,
      statusCode: status,
      ...(isProduction ? {} : { path: request.url, method: request.method, timestamp: new Date().toISOString() }),
    });
  }

  private logError(status: number, request: Request, errorDetail?: string) {
    const logLevel = status >= 500 ? 'error' : 'warn';
    const logMessage = {
      status,
      method: request.method,
      url: request.url,
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      error: errorDetail,
    };

    if (logLevel === 'error') {
      this.logger.error(JSON.stringify(logMessage));
    } else {
      this.logger.warn(JSON.stringify(logMessage));
    }
  }
}

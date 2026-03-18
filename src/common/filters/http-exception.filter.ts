import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  Inject,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { LogsService } from '../../logs/logs.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(
    @Inject(LogsService)
    private logsService: LogsService,
  ) {}

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
    let errorStack: string | undefined;

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      message = typeof res === 'string' ? res : (res as any).message || res;
    } else {
      // 非 HTTP 异常，记录详细错误信息
      message = '服务器内部错误';
      const error = exception as Error;
      errorDetail = error.message || String(exception);
      errorStack = error.stack;
    }

    // 获取请求追踪信息
    const requestId = (request as any).requestId;
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'];
    const clientIp = ip || 'unknown';

    // 记录错误日志
    this.logsService.logHttpError(
      method,
      url,
      status,
      errorDetail || String(message),
      clientIp,
      userAgent,
      requestId,
    );

    // 记录详细错误日志
    this.logsService.error(
      errorDetail || String(message),
      errorStack,
      {
        type: 'http_exception',
        method,
        url,
        statusCode: status,
        ip: clientIp,
        userAgent,
        requestId,
      },
    );

    // 生产环境隐藏内部错误详情
    const isProduction = process.env.NODE_ENV === 'production';

    response.status(status).json({
      success: false,
      error: typeof message === 'string' ? message : (message as any).message || message,
      statusCode: status,
      ...(isProduction ? {} : { path: url, method, timestamp: new Date().toISOString() }),
    });
  }
}

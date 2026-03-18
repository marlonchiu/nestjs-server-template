import { Module, Global, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { LogsService } from './logs.service';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { HttpLoggerMiddleware } from './middleware/http-logger.middleware';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';

/**
 * 日志模块
 * 提供全局日志服务、拦截器和中间件
 */
@Global()
@Module({
  providers: [
    LogsService,
    LoggingInterceptor,
    ErrorInterceptor,
    HttpLoggerMiddleware,
    HttpExceptionFilter,
    // 注册全局请求日志拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // 注册全局错误日志拦截器
    {
      provide: APP_INTERCEPTOR,
      useClass: ErrorInterceptor,
    },
    // 注册全局异常过滤器
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
  exports: [
    LogsService,
    LoggingInterceptor,
    ErrorInterceptor,
    HttpLoggerMiddleware,
  ],
})
export class LogsModule implements NestModule {
  /**
   * 配置中间件消费者
   * 将 HTTP 日志中间件应用于所有路由
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HttpLoggerMiddleware)
      .forRoutes('*');
  }
}

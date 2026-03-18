import { Injectable, LoggerService, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import pino from 'pino';
import { createWriteStream, existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from 'fs';
import { join } from 'path';
import { LogContext } from './interfaces/logger.interface';

/**
 * 自定义多目标写入流
 * 根据日志 type 字段路由到不同的文件
 */
class MultiFileStream {
  private streams: { [key: string]: ReturnType<typeof createWriteStream> } = {};
  private logDir: string;
  private currentDate: string;

  constructor(logDir: string) {
    this.logDir = logDir;
    this.currentDate = this.getCurrentDate();
    this.initStreams();
  }

  private getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private initStreams(): void {
    const types = ['app', 'error', 'access'];
    for (const type of types) {
      const filePath = join(this.logDir, `${type}-${this.currentDate}.log`);
      this.streams[type] = createWriteStream(filePath, { flags: 'a' });
    }
    // 控制台输出
    this.streams['console'] = process.stdout as any;
  }

  private getStream(type: string): any {
    // 检查日期是否变化，如果变化则重新创建流
    const newDate = this.getCurrentDate();
    if (newDate !== this.currentDate) {
      this.close();
      this.currentDate = newDate;
      this.initStreams();
    }

    // 根据 type 返回对应的流
    if (type === 'access') return this.streams['access'];
    if (type === 'error') return this.streams['error'];
    return this.streams['app'];
  }

  write(data: string): void {
    try {
      const obj = JSON.parse(data);
      const type = obj.type || 'app';
      const stream = this.getStream(type);
      stream.write(data + '\n');
    } catch {
      // 如果解析失败，写入 app 日志
      this.streams['app'].write(data + '\n');
    }
  }

  close(): void {
    // 只关闭文件流，不处理 stdout
    if (this.streams['app']) this.streams['app'].end();
    if (this.streams['error']) this.streams['error'].end();
    if (this.streams['access']) this.streams['access'].end();
  }

  sync(): void {
    // 刷新文件流
    (this.streams['app'] as any).flushSync?.();
    (this.streams['error'] as any).flushSync?.();
    (this.streams['access'] as any).flushSync?.();
  }
}

/**
 * 日志服务
 * 使用 pino 日志框架，支持控制台和文件输出（带日志轮转）
 */
@Injectable()
export class LogsService implements LoggerService, OnModuleInit, OnModuleDestroy {
  private logger: pino.Logger;
  private multiStream: MultiFileStream;
  private logDir: string;
  private maxFiles: number;
  private level: string;

  constructor(private configService: ConfigService) {
    this.logDir = this.configService.get<string>('logs.dir') || './logs';
    this.maxFiles = this.configService.get<number>('logs.maxFiles') || 7;
    this.level = this.configService.get<string>('logs.level') || 'info';
    this.ensureLogDir();
    this.initLogger();
    this.cleanupOldLogs();
  }

  onModuleInit() {
    // 定时清理旧日志（每小时检查一次）
    setInterval(() => this.cleanupOldLogs(), 60 * 60 * 1000);
  }

  onModuleDestroy() {
    this.multiStream.close();
  }

  /**
   * 确保日志目录存在
   */
  private ensureLogDir(): void {
    if (!existsSync(this.logDir)) {
      mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * 初始化 pino 日志器（使用多目标输出）
   */
  private initLogger(): void {
    this.multiStream = new MultiFileStream(this.logDir);

    this.logger = pino(
      {
        level: this.level,
        formatters: {
          level: (label) => ({ level: label }),
        },
      },
      this.multiStream,
    );
  }

  /**
   * 清理过期日志文件
   */
  private cleanupOldLogs(): void {
    try {
      if (!existsSync(this.logDir)) return;

      const files = readdirSync(this.logDir);
      const now = Date.now();
      const maxAge = this.maxFiles * 24 * 60 * 60 * 1000;

      for (const file of files) {
        if (!file.endsWith('.log')) continue;

        const filePath = join(this.logDir, file);
        const stats = statSync(filePath);
        const age = now - stats.mtimeMs;

        if (age > maxAge) {
          unlinkSync(filePath);
          this.logger.info({ file, reason: 'expired' }, 'Deleted old log file');
        }
      }
    } catch (error) {
      console.error('Failed to cleanup old logs:', error);
    }
  }

  /**
   * 记录跟踪级别日志
   */
  trace(message: any, context?: LogContext): void;
  trace(message: any, ...args: any[]): void;
  trace(message: any, context?: any): void {
    const msg = this.formatMessage(message, context);
    this.logger.trace(msg);
  }

  /**
   * 记录调试级别日志
   */
  debug(message: any, context?: LogContext): void;
  debug(message: any, ...args: any[]): void;
  debug(message: any, context?: any): void {
    const msg = this.formatMessage(message, context);
    this.logger.debug(msg);
  }

  /**
   * 记录信息级别日志
   */
  log(message: any, context?: LogContext): void;
  log(message: any, ...args: any[]): void;
  log(message: any, context?: any): void {
    const msg = this.formatMessage(message, context);
    this.logger.info(msg);
  }

  /**
   * 记录警告级别日志
   */
  warn(message: any, context?: LogContext): void;
  warn(message: any, ...args: any[]): void;
  warn(message: any, context?: any): void {
    const msg = this.formatMessage(message, context);
    this.logger.warn(msg);
  }

  /**
   * 记录错误级别日志
   */
  error(message: any, trace?: string, context?: LogContext): void;
  error(message: any, ...args: any[]): void;
  error(message: any, trace?: any, context?: any): void {
    const msg = this.formatMessage(message, context);
    if (trace instanceof Error) {
      this.logger.error({ ...msg, stack: trace.stack }, trace.message);
    } else if (typeof trace === 'object') {
      this.logger.error({ ...msg, ...trace });
    } else {
      this.logger.error(msg, trace);
    }
  }

  /**
   * 记录致命错误日志
   */
  fatal(message: any, context?: LogContext): void {
    const msg = this.formatMessage(message, context);
    this.logger.fatal(msg);
  }

  /**
   * 格式化消息和上下文
   */
  private formatMessage(message: any, context?: any): any {
    if (typeof message === 'object') {
      return { ...message, context };
    }
    return { message, context };
  }

  /**
   * 记录 HTTP 访问日志
   */
  logHttpAccess(
    method: string,
    url: string,
    statusCode: number,
    responseTime: number,
    ip: string,
    userAgent?: string,
    requestId?: string,
    userId?: string,
  ): void {
    const logData = {
      type: 'access',
      method,
      url,
      statusCode,
      responseTime: `${responseTime}ms`,
      ip,
      userAgent,
      requestId,
      userId,
    };

    this.logger.info(logData);
  }

  /**
   * 记录 HTTP 错误日志
   */
  logHttpError(
    method: string,
    url: string,
    statusCode: number,
    errorMessage: string,
    ip: string,
    userAgent?: string,
    requestId?: string,
    responseTime?: number,
  ): void {
    const logData = {
      type: 'error',
      method,
      url,
      statusCode,
      errorMessage,
      ip,
      userAgent,
      requestId,
      responseTime: responseTime ? `${responseTime}ms` : undefined,
    };

    this.logger.error(logData);
  }
}

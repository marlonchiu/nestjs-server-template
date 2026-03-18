/**
 * 日志级别枚举
 */
export enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

/**
 * 日志配置接口
 */
export interface LogsConfig {
  level: string;
  dir: string;
  maxFiles: number;
  maxSize: string;
}

/**
 * 请求日志元数据接口
 */
export interface RequestLogMetadata {
  method: string;
  url: string;
  ip: string;
  userAgent?: string;
  requestId?: string;
  userId?: string;
  params?: Record<string, any>;
  query?: Record<string, any>;
  body?: Record<string, any>;
}

/**
 * 响应日志元数据接口
 */
export interface ResponseLogMetadata {
  statusCode: number;
  responseTime: number;
  requestId?: string;
}

/**
 * 错误日志元数据接口
 */
export interface ErrorLogMetadata {
  method: string;
  url: string;
  ip: string;
  userAgent?: string;
  requestId?: string;
  statusCode: number;
  errorMessage: string;
  errorStack?: string;
  responseTime?: number;
}

/**
 * 自定义日志上下文接口
 */
export interface LogContext {
  requestId?: string;
  userId?: string;
  correlationId?: string;
  [key: string]: any;
}

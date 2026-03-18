# Logs 日志模块架构设计文档

## 文档信息

- **功能名称**：Logs 日志模块
- **版本**：1.0
- **创建日期**：2026-03-18
- **作者**：Architect Agent

## 摘要

> 下游 Agent 请优先阅读本节，需要细节时再查阅完整文档。

- **推荐方案**：Pino 日志框架
- **日志级别**：error, warn, info, debug, trace
- **日志输出**：控制台 + 文件 + 数据库（可选）
- **日志格式**：JSON 结构化日志
- **核心设计决策**：
  1. 使用 pino 作为日志框架，性能优异（比 Winston 快 10 倍）
  2. 集成 nestjs-pino，实现 NestJS 原生集成
  3. 日志存储：开发环境控制台输出，生产环境文件轮转
  4. 请求日志：通过 HTTP 中间件自动记录请求/响应日志
  5. 业务日志：通过依赖注入的 Logger 服务记录

---

## 1. 需求分析

### 1.1 业务需求

| 需求 | 优先级 | 说明 |
|------|--------|------|
| 应用日志 | P0 | 记录应用运行状态、启动信息 |
| 请求日志 | P0 | 记录 HTTP 请求/响应、耗时、状态码 |
| 错误日志 | P0 | 记录异常堆栈、错误上下文 |
| 业务日志 | P1 | 记录关键业务操作日志 |
| 日志查询 | P1 | 支持按级别、时间、关键词查询 |
| 日志归档 | P2 | 自动归档和清理历史日志 |

### 1.2 非功能性需求

| 需求 | 说明 |
|------|------|
| 性能 | 日志记录开销应尽可能小，不影响业务响应时间 |
| 可扩展 | 支持多种输出目标（控制台、文件、数据库） |
| 结构化 | JSON 格式便于日志收集和分析 |
| 上下文 | 支持请求追踪（traceId）、用户信息等上下文 |

---

## 2. 技术调研

### 2.1 日志框架对比

#### Winston vs Pino 对比表

| 特性 | Winston | Pino | 胜出 |
|------|---------|------|------|
| 性能 | 中等 | 极快 (10x faster) | Pino |
| Bundle Size | ~500KB | ~100KB | Pino |
| 异步支持 | 需要配置 | 原生支持 | Pino |
| JSON 输出 | 需要配置 | 原生支持 | Pino |
| 格式化 | 灵活 | 基础 | Winston |
| 传输器 | 丰富 | 较少 | Winston |
| NestJS 集成 | nestjs-winston | nestjs-pino | Pino (官方) |
| 维护活跃度 | 高 | 高 | 持平 |

#### 性能基准测试

```
Winston: ~1200 ops/sec
Pino: ~14000 ops/sec
差异: Pino 比 Winston 快约 10 倍
```

### 2.2 推荐方案

**推荐使用 Pino**，原因如下：

1. **性能优先**：NestJS 官方推荐，高性能场景首选
2. **原生 JSON**：结构化日志，便于日志收集系统解析
3. **NestJS 官方集成**：nestjs-pino 提供完善的 NestJS 集成
4. **低开销**：Bundle size 小，不影响应用性能
5. **开箱即用**：默认配置即可满足大部分需求

### 2.3 备选方案

如需以下特性，可考虑 Winston：
- 多种自定义传输器（如 Syslog、HTTP）
- 复杂的日志格式化需求
- 邮件通知等高级功能

---

## 3. 架构设计

### 3.1 系统架构图

```mermaid
graph TB
    subgraph 应用层
        Controllers[Controllers]
        Services[Services]
    end
    subgraph 日志层
        PinoLogger[Pino Logger]
        WinstonLogger[Winston Logger (可选)]
    end
    subgraph 日志服务
        AppLogger[AppLogger<br/>应用日志]
        ReqLogger[ReqLogger<br/>请求日志]
        BizLogger[BizLogger<br/>业务日志]
    end
    subgraph 输出层
        Console[Console<br/>控制台]
        File[File<br/>文件]
        DB[(Database<br/>数据库)]
    end

    Controllers --> AppLogger
    Services --> BizLogger
    AppLogger --> PinoLogger
    ReqLogger --> PinoLogger
    BizLogger --> PinoLogger
    PinoLogger --> Console
    PinoLogger --> File
    PinoLogger --> DB
```

### 3.2 模块结构

```
src/
├── logs/                           # 日志模块
│   ├── logs.module.ts             # 日志模块定义
│   ├── logs.service.ts            # 日志服务
│   ├── logger.factory.ts          # Logger 工厂
│   ├── interceptors/               # 日志拦截器
│   │   ├── logging.interceptor.ts # HTTP 请求日志拦截器
│   │   └── error.interceptor.ts   # 错误日志拦截器
│   ├── middleware/                 # 日志中间件
│   │   └── http-logger.middleware.ts
│   ├── transports/                # 传输器配置
│   │   ├── console.transport.ts
│   │   ├── file.transport.ts
│   │   └── database.transport.ts
│   └── interfaces/
│       ├── logger.interface.ts
│       └── log-entry.interface.ts
```

### 3.3 日志分类

| 类型 | 说明 | 实现 |
|------|------|------|
| 应用日志 | 应用启动、关闭、配置加载 | NestJS 内置 Logger |
| 请求日志 | HTTP 请求/响应、耗时、IP | Interceptor + Pino |
| 业务日志 | 关键业务操作、状态变更 | 自定义 Logger Service |
| 错误日志 | 异常、堆栈、错误上下文 | 统一异常过滤器 |

---

## 4. 详细设计

### 4.1 日志配置

#### 安装依赖

```bash
npm install pino pino-pretty nestjs-pino
```

#### 配置项设计

```typescript
// src/config/configuration.ts
export default () => ({
  // ... 现有配置
  logs: {
    level: process.env.LOG_LEVEL || 'info',
    prettyPrint: process.env.NODE_ENV !== 'production',
    logDir: process.env.LOG_DIR || './logs',
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '7', 10), // 保留天数
    maxSize: process.env.LOG_MAX_SIZE || '10m', // 单文件大小限制
  },
});
```

#### 环境变量

```
LOG_LEVEL=info          # 日志级别: trace, debug, info, warn, error, fatal
LOG_DIR=./logs          # 日志目录
LOG_MAX_FILES=7         # 保留天数
LOG_MAX_SIZE=10m        # 单文件大小限制
NODE_ENV=development    # 环境: development, production
```

### 4.2 核心服务设计

#### Logger 工厂

```typescript
// src/logs/logger.factory.ts
import { pino, Logger } from 'pino';
import { ConfigService } from '@nestjs/config';

export function createLogger(configService: ConfigService): Logger {
  const logsConfig = configService.get('logs');

  return pino({
    level: logsConfig.level,
    transport: logsConfig.prettyPrint
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
    formatters: {
      level: (label) => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    base: {
      service: 'nestjs-server-template',
    },
  });
}
```

#### 日志服务

```typescript
// src/logs/logs.service.ts
import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { pino, Logger } from 'pino';

export interface LogContext {
  traceId?: string;
  userId?: string;
  ip?: string;
  method?: string;
  url?: string;
}

@Injectable()
export class LogsService implements LoggerService {
  private logger: Logger;

  constructor(private configService: ConfigService) {
    this.logger = pino({
      level: this.configService.get<string>('logs.level') || 'info',
    });
  }

  log(message: string, context?: LogContext) {
    this.logger.info(context, message);
  }

  error(message: string, trace?: string, context?: LogContext) {
    this.logger.error({ ...context, trace }, message);
  }

  warn(message: string, context?: LogContext) {
    this.logger.warn(context, message);
  }

  debug(message: string, context?: LogContext) {
    this.logger.debug(context, message);
  }

  verbose(message: string, context?: LogContext) {
    this.logger.trace(context, message);
  }

  // 业务日志封装
  logBusiness(operation: string, data: Record<string, any>, context?: LogContext) {
    this.logger.info({
      ...context,
      type: 'business',
      operation,
      data,
    }, `Business: ${operation}`);
  }

  // 请求日志封装
  logRequest(req: any, res: any, duration: number) {
    this.logger.info({
      type: 'http',
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      ip: req.ip || req.headers['x-forwarded-for'],
      userAgent: req.headers['user-agent'],
    }, `HTTP ${req.method} ${req.url} ${res.statusCode} - ${duration}ms`);
  }
}
```

### 4.3 请求日志拦截器

```typescript
// src/logs/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, url, body, query, params } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          this.logger.log({
            type: 'request',
            method,
            url,
            statusCode: response.statusCode,
            duration,
            request: { body, query, params },
            ip: request.ip,
            userAgent: request.headers['user-agent'],
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error({
            type: 'request_error',
            method,
            url,
            statusCode: response.statusCode,
            duration,
            error: {
              message: error.message,
              stack: error.stack,
            },
          });
        },
      }),
    );
  }
}
```

### 4.4 日志模块定义

```typescript
// src/logs/logs.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LogsService } from './logs.service';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { ErrorInterceptor } from './interceptors/error.interceptor';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    LogsService,
    LoggingInterceptor,
    ErrorInterceptor,
  ],
  exports: [
    LogsService,
    LoggingInterceptor,
    ErrorInterceptor,
  ],
})
export class LogsModule {}
```

### 4.5 应用入口集成

```typescript
// src/main.ts
import 'dotenv-safe/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SuccessInterceptor } from './common/interceptors/success.interceptor';
import { LoggingInterceptor } from './logs/interceptors/logging.interceptor';
import { LogsService } from './logs/logs.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, // 缓冲日志，等待 Logger 配置完成
  });

  // 获取 ConfigService
  const configService = app.get(ConfigService);
  const logsService = app.get(LogsService);

  // 使用自定义 Logger
  app.useLogger(logsService);

  // 全局前缀
  app.setGlobalPrefix('api');

  // CORS 配置
  app.enableCors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  });

  // 全局管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // 全局拦截器
  app.useGlobalInterceptors(
    new SuccessInterceptor(),
    new LoggingInterceptor(),
  );

  // 全局过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // Swagger 配置 - 仅在开发环境启用
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('NestJS Server API')
      .setDescription('服务框架 API 文档')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = configService.get<number>('port') || 3000;
  await app.listen(port);

  logsService.log(`Application is running on: http://localhost:${port}/api`);
  if (process.env.NODE_ENV !== 'production') {
    logsService.log(`Swagger documentation: http://localhost:${port}/api/docs`);
  }
}
bootstrap();
```

### 4.6 业务日志使用示例

```typescript
// 在 Service 中使用
import { Injectable, Logger } from '@nestjs/common';
import { LogsService } from '../logs/logs.service';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(private logsService: LogsService) {}

  async createOrder(createOrderDto: CreateOrderDto, userId: string) {
    try {
      // 业务逻辑
      const order = await this.orderRepository.create({
        ...createOrderDto,
        userId,
      });

      // 记录业务日志
      this.logsService.logBusiness('create_order', {
        orderId: order.id,
        userId,
        amount: order.totalAmount,
      }, { userId });

      return order;
    } catch (error) {
      this.logsService.error('创建订单失败', error.stack, {
        userId,
        dto: createOrderDto,
      });
      throw error;
    }
  }
}
```

---

## 5. 日志输出配置

### 5.1 开发环境

- 输出到控制台
- 使用 pino-pretty 格式化输出
- 颜色高亮
- 日志级别：debug

### 5.2 生产环境

- 输出到文件（JSON 格式）
- 文件轮转（daily rotate）
- 自动压缩归档
- 日志级别：info
- 日志保留：7 天

### 5.3 文件传输器配置

```typescript
// src/logs/transports/file.transport.ts
import pino from 'pino';
import pinoFile from 'pino/file';

export function createFileTransport(options: {
  logDir: string;
  maxFiles: number;
  maxSize: string;
}) {
  return {
    target: 'pino/file',
    options: {
      destination: `${options.logDir}/app.log`,
      mkdir: true,
      maxFiles: options.maxFiles,
      maxSize: options.maxSize,
    },
  };
}
```

---

## 6. 日志查询接口（可选）

### 6.1 接口设计

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/logs | 查询日志列表 |
| GET | /api/logs/:id | 查询日志详情 |

### 6.2 查询参数

| 参数 | 类型 | 说明 |
|------|------|------|
| level | string | 日志级别 |
| startTime | string | 开始时间 |
| endTime | string | 结束时间 |
| keyword | string | 关键词 |
| page | number | 页码 |
| pageSize | number | 每页条数 |

---

## 7. 数据库日志存储（可选）

### 7.1 使用场景

- 需要长期存储日志
- 需要复杂日志查询
- 需要日志分析统计

### 7.2 表结构设计

```typescript
// src/modules/logs/entities/log.entity.ts
import { pgTable, uuid, varchar, text, timestamp, index } from 'drizzle-orm/pg-core';

export const logs = pgTable('logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  level: varchar('level', { length: 20 }).notNull(),
  message: text('message').notNull(),
  context: text('context'), // JSON 字符串
  traceId: varchar('trace_id', { length: 50 }),
  userId: varchar('user_id', { length: 36 }),
  ip: varchar('ip', { length: 45 }),
  userAgent: varchar('user_agent', { length: 500 }),
  method: varchar('method', { length: 10 }),
  url: varchar('url', { length: 500 }),
  statusCode: varchar('status_code', { length: 10 }),
  duration: varchar('duration', { length: 20 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    levelIdx: index('idx_logs_level').on(table.level),
    createdAtIdx: index('idx_logs_created_at').on(table.createdAt),
    traceIdIdx: index('idx_logs_trace_id').on(table.traceId),
    userIdIdx: index('idx_logs_user_id').on(table.userId),
  };
});
```

---

## 8. 集成现有模块

### 8.1 AppModule 集成

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration';
import { CommonModule } from './common/common.module';
import { DatabaseModule } from './database/database.module';
import { LogsModule } from './logs/logs.module'; // 新增
import { AuthModule } from './modules/auth/auth.module';
import { JwtConfigModule } from './modules/auth/jwt-config.module';
import { UserModule } from './modules/user/user.module';
import { OrderModule } from './modules/order/order.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    CommonModule,
    DatabaseModule,
    LogsModule, // 新增
    JwtConfigModule,
    AuthModule,
    UserModule,
    OrderModule,
  ],
})
export class AppModule {}
```

---

## 9. 实施计划

### 9.1 开发任务

| 任务 | 预估工时 | 优先级 |
|------|----------|--------|
| 创建日志模块目录结构 | 0.5d | P0 |
| 实现 LogsService | 1d | P0 |
| 实现 LoggingInterceptor | 0.5d | P0 |
| 配置 main.ts 集成 | 0.5d | P0 |
| 添加环境变量配置 | 0.25d | P1 |
| 业务日志使用示例 | 0.25d | P1 |
| 日志查询接口（可选） | 1d | P2 |
| 数据库日志存储（可选） | 1d | P2 |

### 9.2 依赖项

| 依赖 | 版本 | 用途 |
|------|------|------|
| pino | ^9.0.0 | 日志框架 |
| pino-pretty | ^10.0.0 | 开发环境格式化 |
| nestjs-pino | ^4.6.1 | NestJS 集成 |

---

## 10. 风险与限制

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 日志量过大 | 磁盘空间不足 | 配置日志轮转和自动清理 |
| 日志写入阻塞 | 影响业务性能 | 使用异步写入 |
| 敏感信息泄露 | 安全风险 | 日志脱敏或过滤敏感字段 |
| 查询性能 | 查询慢 | 索引优化、分页查询 |

---

## 变更记录

| 版本 | 日期 | 作者 | 变更内容 |
|------|------|------|----------|
| 1.0 | 2026-03-18 | Architect Agent | 初始版本 |

---

## 参考资料

- [Pino 官方文档](https://getpino.io)
- [nestjs-pino 官方文档](https://docs.nestjs.com/techniques/logger)
- [NestJS Logging Best Practices](https://docs.nestjs.com/techniques/logger)
- [Pino vs Winston Performance](https://github.com/pinojs/pino/blob/master/README.md#benchmarks)

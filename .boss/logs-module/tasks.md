# Logs 日志模块 - 开发任务拆解

## 概述

本文档将 Logs 日志模块的开发任务拆解为具体的子任务，明确每个任务的文件变更。

---

## 任务列表

### 阶段一：基础设施搭建

#### T001: 安装日志依赖

**描述**: 安装 pino 日志框架及相关依赖

**文件变更**:
- `package.json` - 添加依赖: `pino`, `pino-pretty`, `nestjs-pino`

**命令**:
```bash
npm install pino pino-pretty nestjs-pino
```

---

#### T002: 添加日志配置

**描述**: 在配置文件中添加日志相关配置项

**文件变更**:
- `src/config/configuration.ts` - 添加 `logs` 配置对象

**配置项**:
```typescript
logs: {
  level: process.env.LOG_LEVEL || 'info',
  prettyPrint: process.env.NODE_ENV !== 'production',
  logDir: process.env.LOG_DIR || './logs',
  maxFiles: parseInt(process.env.LOG_MAX_FILES || '7', 10),
  maxSize: process.env.LOG_MAX_SIZE || '10m',
}
```

---

#### T003: 添加日志环境变量

**描述**: 在 .env.example 中添加日志相关环境变量

**文件变更**:
- `.env.example` - 添加日志配置项

**环境变量**:
```
LOG_LEVEL=info
LOG_DIR=./logs
LOG_MAX_FILES=7
LOG_MAX_SIZE=10m
```

---

### 阶段二：核心模块实现

#### T004: 创建日志模块目录结构

**描述**: 创建日志模块的目录结构

**新增目录**:
```
src/logs/
├── interceptors/
├── middleware/
├── interfaces/
```

---

#### T005: 定义日志接口

**描述**: 定义日志相关的 TypeScript 接口

**新增文件**:
- `src/logs/interfaces/logger.interface.ts` - Logger 接口定义
- `src/logs/interfaces/log-entry.interface.ts` - 日志条目接口

---

#### T006: 实现日志服务 (LogsService)

**描述**: 实现核心日志服务，提供统一日志接口

**新增文件**:
- `src/logs/logs.service.ts`

**功能**:
- 实现 `LoggerService` 接口
- 提供 `log`, `error`, `warn`, `debug`, `verbose` 方法
- 实现 `logBusiness` 业务日志方法
- 实现 `logRequest` 请求日志方法

---

#### T007: 实现请求日志拦截器

**描述**: 实现 HTTP 请求日志拦截器，自动记录请求信息

**新增文件**:
- `src/logs/interceptors/logging.interceptor.ts`

**功能**:
- 记录请求方法、URL、状态码、响应时间
- 记录客户端 IP、User-Agent
- 记录请求参数 (body, query, params)

---

#### T008: 实现错误日志拦截器

**描述**: 实现错误日志拦截器，自动捕获异常

**新增文件**:
- `src/logs/interceptors/error.interceptor.ts`

**功能**:
- 捕获未处理异常
- 记录错误堆栈信息
- 记录请求上下文

---

#### T009: 实现请求追踪中间件

**描述**: 实现请求追踪中间件，生成 traceId

**新增文件**:
- `src/logs/middleware/http-logger.middleware.ts`

**功能**:
- 为每个请求生成唯一 traceId
- 将 traceId 注入到请求头

---

#### T010: 实现日志传输器配置

**描述**: 实现不同环境的日志传输器配置

**新增文件**:
- `src/logs/transports/console.transport.ts` - 控制台输出
- `src/logs/transports/file.transport.ts` - 文件输出

---

#### T011: 创建日志模块

**描述**: 创建日志模块，整合所有日志组件

**新增文件**:
- `src/logs/logs.module.ts`

**配置**:
- 注册为全局模块 (Global)
- 导出 LogsService、拦截器

---

### 阶段三：集成配置

#### T012: 集成日志模块到 AppModule

**描述**: 在应用模块中引入日志模块

**文件变更**:
- `src/app.module.ts` - 添加 LogsModule 导入

---

#### T013: 集成日志到 main.ts

**描述**: 在应用入口中配置日志服务

**文件变更**:
- `src/main.ts` - 集成日志服务

**变更内容**:
- 使用 `bufferLogs: true` 缓冲日志
- 使用自定义 Logger 替代内置 Logger
- 注册全局拦截器

---

#### T014: 更新错误过滤器集成日志

**描述**: 更新现有错误过滤器，集成日志记录

**文件变更**:
- `src/common/filters/http-exception.filter.ts` - 注入 LogsService

---

### 阶段四：业务集成 (可选)

#### T015: 业务日志使用示例

**描述**: 在现有模块中展示业务日志的使用方式

**文件变更**:
- 任意现有 Service 文件 (如 `src/modules/user/user.service.ts`)

**示例**:
```typescript
constructor(private logsService: LogsService) {}

createUser(dto: CreateUserDto) {
  // 业务逻辑
  this.logsService.logBusiness('create_user', { userId, email }, { userId });
}
```

---

## 任务依赖关系

```
T001 (安装依赖)
    │
    ├── T002 (配置)
    │       │
    │       └── T003 (.env)
    │
    └── T004 (目录结构)
            │
            ├── T005 (接口)
            │       │
            │       └── T006 (日志服务)
            │               │
            │               ├── T007 (请求拦截器)
            │               ├── T008 (错误拦截器)
            │               └── T010 (传输器)
            │
            └── T009 (中间件)
                    │
                    └── T011 (模块)

T011 ──> T012 ──> T013 ──> T014
```

---

## 优先级分组

### P0 - 必须完成

| 任务 ID | 任务名称 | 文件变更 |
|---------|----------|----------|
| T001 | 安装日志依赖 | package.json |
| T002 | 添加日志配置 | src/config/configuration.ts |
| T005 | 定义日志接口 | src/logs/interfaces/*.ts |
| T006 | 实现日志服务 | src/logs/logs.service.ts |
| T011 | 创建日志模块 | src/logs/logs.module.ts |
| T012 | 集成到 AppModule | src/app.module.ts |
| T013 | 集成到 main.ts | src/main.ts |

### P1 - 建议完成

| 任务 ID | 任务名称 | 文件变更 |
|---------|----------|----------|
| T003 | 添加环境变量 | .env.example |
| T007 | 请求日志拦截器 | src/logs/interceptors/logging.interceptor.ts |
| T008 | 错误日志拦截器 | src/logs/interceptors/error.interceptor.ts |
| T009 | 请求追踪中间件 | src/logs/middleware/http-logger.middleware.ts |
| T010 | 日志传输器 | src/logs/transports/*.ts |
| T014 | 更新错误过滤器 | src/common/filters/http-exception.filter.ts |

### P2 - 可选

| 任务 ID | 任务名称 | 文件变更 |
|---------|----------|----------|
| T015 | 业务日志示例 | 现有 Service 文件 |

---

## 验收标准

完成所有 P0 任务后，日志模块应满足以下验收标准：

- [ ] 应用启动时自动初始化日志服务
- [ ] 日志以 JSON 格式输出
- [ ] 可通过环境变量配置日志级别
- [ ] 日志同时输出到控制台和文件
- [ ] 其他模块可注入 LogsService 使用

完成 P1 任务后，额外满足：

- [ ] 所有 API 请求自动记录访问日志
- [ ] 错误自动记录错误日志并包含堆栈信息
- [ ] 每个请求生成唯一的 traceId
- [ ] 日志文件按天分割，支持自动清理

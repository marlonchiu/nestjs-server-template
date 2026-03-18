# NestJS Enterprise API Framework

企业级 Node.js RESTful API 服务框架，基于 NestJS + TypeScript + PostgreSQL 构建。

## 特性亮点

### 现代化技术栈
- **NestJS 10** - Node.js 企业级框架，遵循 SOLID 原则
- **TypeScript 5** - 强类型支持，编译期安全保障
- **Drizzle ORM** - 轻量级、高性能 SQL 查询构建器
- **PostgreSQL 14+** - 企业级关系型数据库

### 安全防护
- **JWT 认证** - 无状态用户认证
- **Ownership 权限控制** - 基于资源的细粒度权限管理
- **bcrypt 加密** - 密码安全存储（12 轮哈希）
- **Rate Limiting** - API 访问频率限制，防止暴力攻击
- **CORS 配置** - 跨域资源共享控制

### 高质量代码
- **TypeScript 严格模式** - 编译期类型检查
- **完整单元测试** - Jest 测试框架，24+ 测试用例
- **dotenv-safe** - 环境变量强制校验
- **统一错误处理** - 结构化日志记录

### 工程化实践
- **模块化架构** - 清晰的模块划分
- **Swagger API 文档** - 自动生成可交互文档
- **开发/生产环境分离** - 环境感知配置
- **Docker 构建优化** - 准备就绪

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| Node.js | >= 18 | JavaScript 运行时 |
| TypeScript | ^5.1 | 类型安全的 JavaScript |
| NestJS | ^10.0 | Node.js 企业级框架 |
| Drizzle ORM | ^0.29 | 轻量级 TypeScript ORM |
| PostgreSQL | >= 14 | 关系型数据库 |
| JWT | ^10.0 | 用户认证 |
| Swagger | ^7.0 | API 文档自动生成 |
| Throttler | ^6.0 | 速率限制 |

## 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                      Controller Layer                    │
│   (Auth / User / Order Controllers)                    │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                       Service Layer                      │
│   (业务逻辑处理、数据验证、事务管理)                       │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                    Repository Layer                      │
│   (Drizzle ORM - 数据库操作)                            │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                     Database Layer                        │
│   (PostgreSQL - 数据持久化)                             │
└─────────────────────────────────────────────────────────┘
```

## 核心能力

| 模块 | 功能 |
|------|------|
| 认证模块 | 用户注册、登录、JWT 令牌签发 |
| 用户管理 | CRUD、权限控制、数据分页 |
| 订单管理 | 订单创建、金额服务端校验、状态流转 |
| 公共组件 | 统一响应格式、异常过滤、日志记录 |

## 项目结构

```
nestjs-server-template/
├── src/
│   ├── main.ts                      # 应用入口
│   ├── app.module.ts                # 根模块
│   ├── config/
│   │   └── configuration.ts          # 配置文件
│   ├── common/                       # 公共模块
│   │   ├── common.module.ts          # 公共模块定义
│   │   ├── index.ts                   # 公共组件导出
│   │   ├── interceptors/              # 拦截器（统一响应格式）
│   │   │   ├── success.interceptor.ts
│   │   │   └── transform.interceptor.ts
│   │   ├── filters/                  # 过滤器（异常处理）
│   │   │   └── http-exception.filter.ts
│   │   ├── guards/                   # 守卫（认证授权）
│   │   │   ├── auth.guard.ts         # JWT 认证守卫
│   │   │   └── ownership.guard.ts     # 权限守卫
│   │   ├── pipes/                    # 管道（数据验证）
│   │   │   └── validation.pipe.ts
│   │   └── decorators/               # 装饰器
│   │       ├── current-user.decorator.ts
│   │       └── check-ownership.decorator.ts
│   ├── database/                     # 数据库模块
│   │   ├── database.module.ts         # 数据库连接（含连接池）
│   │   ├── schema.ts                 # 数据库 Schema 导出
│   │   ├── index.ts                  # 数据库导出
│   │   └── migrations/               # 迁移文件
│   │       ├── schema.ts
│   │       └── relations.ts
│   ├── modules/                      # 业务模块
│   │   ├── auth/                     # 认证模块
│   │   │   ├── auth.controller.ts    # 控制器
│   │   │   ├── auth.service.ts       # 服务
│   │   │   ├── auth.module.ts        # 模块
│   │   │   ├── jwt-config.module.ts  # JWT 共享配置
│   │   │   └── dto/                  # 数据传输对象
│   │   │       ├── login.dto.ts
│   │   │       └── register.dto.ts
│   │   ├── user/                     # 用户模块
│   │   │   ├── user.controller.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.module.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-user.dto.ts
│   │   │   │   └── update-user.dto.ts
│   │   │   └── entities/
│   │   │       └── user.entity.ts
│   │   └── order/                    # 订单模块
│   │       ├── order.controller.ts
│   │       ├── order.service.ts
│   │       ├── order.module.ts
│   │       ├── dto/
│   │       │   ├── create-order.dto.ts
│   │       │   └── update-order.dto.ts
│   │       └── entities/
│   │           └── order.entity.ts
│   └── utils/                        # 工具函数
│       ├── hash.util.ts              # 密码加密
│       └── index.ts                  # 工具导出
├── test/                             # 测试文件
│   └── (Jest 测试用例)
├── .env                              # 环境配置
├── .env.example                      # 环境配置示例
├── package.json
├── tsconfig.json
├── nest-cli.json
└── drizzle.config.ts                 # Drizzle 配置
```

## 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

编辑 `.env` 文件：

```env
# 数据库配置
PG_HOST=localhost
PG_PORT=5432
PG_USERNAME=postgres
PG_PASSWORD=your_password
PG_DATABASE=nestjs_app

# 应用配置
PORT=3000
NODE_ENV=development
CORS_ORIGIN=true

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
```

### 3. 同步数据库

```bash
# 推送 Schema 到数据库（推荐）
pnpm run db:push

# 或生成迁移文件
pnpm run db:generate
pnpm run db:migrate
```

### 4. 启动服务

```bash
# 开发模式（热重载）
pnpm run start:dev

# 生产模式
pnpm run build
pnpm run start:prod
```

### 5. 访问服务

- API 地址：http://localhost:3000/api
- Swagger 文档：http://localhost:3000/api/docs

## API 文档

### 统一响应格式

**成功响应**：
```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

**错误响应**：
```json
{
  "success": false,
  "error": "错误描述",
  "statusCode": 400
}
```

### Auth 模块

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| POST | /api/auth/register | 用户注册 | 否 |
| POST | /api/auth/login | 用户登录 | 否 |

**注册请求**：
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "张三"
}
```

**登录请求**：
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**登录响应**：
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "张三",
    "role": "user"
  }
}
```

### User 模块

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | /api/users | 获取用户列表（支持分页） | 是 |
| GET | /api/users/:id | 获取用户详情 | 是 |
| POST | /api/users | 创建用户 | 是 |
| PATCH | /api/users/:id | 更新用户 | 是 |
| DELETE | /api/users/:id | 删除用户 | 是 |

**分页参数**：
- `?pageNum=1&pageSize=10` - 获取第1页，每页10条（默认值）

**分页响应**：
```json
{
  "success": true,
  "data": [...],
  "total": 100,
  "pageNum": 1,
  "pageSize": 10,
  "totalPages": 10
}
```

### Order 模块

| 方法 | 路径 | 描述 | 认证 |
|------|------|------|------|
| GET | /api/orders | 获取订单列表（支持分页） | 是 |
| GET | /api/orders/:id | 获取订单详情 | 是 |
| POST | /api/orders | 创建订单 | 是 |
| PATCH | /api/orders/:id | 更新订单 | 是 |
| DELETE | /api/orders/:id | 删除订单 | 是 |

**创建订单请求**：
```json
{
  "userId": "uuid",
  "totalAmount": 100.00,
  "items": [
    {
      "productId": "uuid",
      "name": "商品名称",
      "price": 50.00,
      "quantity": 2
    }
  ]
}
```

## 数据库 Schema

### users 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 用户 ID |
| email | VARCHAR(255) | UNIQUE | 邮箱 |
| password | VARCHAR(255) | NOT NULL | 密码（加密存储） |
| name | VARCHAR(100) | - | 用户名 |
| role | ENUM | DEFAULT 'user' | 角色 |
| createdAt | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updatedAt | TIMESTAMP | DEFAULT NOW() | 更新时间 |

### orders 表

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | UUID | PK | 订单 ID |
| userId | UUID | FK | 用户 ID |
| totalAmount | DECIMAL(10,2) | NOT NULL | 订单金额 |
| status | ENUM | DEFAULT 'pending' | 订单状态 |
| items | JSONB | NOT NULL | 订单明细 |
| createdAt | TIMESTAMP | DEFAULT NOW() | 创建时间 |
| updatedAt | TIMESTAMP | DEFAULT NOW() | 更新时间 |

## 可用脚本

| 命令 | 说明 |
|------|------|
| `pnpm run build` | 构建项目 |
| `pnpm run start` | 启动服务 |
| `pnpm run start:dev` | 开发模式（热重载） |
| `pnpm run start:prod` | 生产模式 |
| `pnpm run test` | 运行测试 |
| `pnpm run test:watch` | 测试监听模式 |
| `pnpm run test:cov` | 测试覆盖率 |
| `pnpm run db:push` | 推送 Schema 到数据库 |
| `pnpm run db:studio` | 打开 Drizzle Studio |
| `pnpm run db:generate` | 生成迁移文件 |
| `pnpm run db:migrate` | 执行迁移 |

## 安全特性

### 认证授权
- JWT 无状态认证，支持 Token 刷新
- 基于资源的Ownership 权限控制，用户只能操作自己的数据
- 密码 bcrypt 12 轮加密存储

### API 防护
- 请求频率限制（Throttler）：默认 100 请求/分钟
- CORS 跨域配置
- 输入验证（ValidationPipe）

### 生产安全
- Swagger 文档仅开发环境启用
- 错误日志结构化输出，生产环境隐藏内部细节
- 环境变量校验（dotenv-safe）

## 性能优化

- 数据库连接池配置（最大 20 连接）
- 分页查询支持，避免全表扫描
- 异步非阻塞 I/O

## 扩展开发

### 添加新模块

1. 在 `src/modules/` 下创建新模块目录
2. 创建 `xxx.controller.ts`（控制器）
3. 创建 `xxx.service.ts`（服务）
4. 创建 `xxx.module.ts`（模块）
5. 创建 `dto/` 目录定义 DTO
6. 创建 `entities/` 目录定义实体
7. 在 `app.module.ts` 中导入新模块

### 添加新实体

1. 在对应模块的 `entities/` 目录创建 `.entity.ts` 文件
2. 在 `src/database/schema.ts` 中导出实体

### 统一响应格式

项目使用 Interceptor 统一成功响应格式，使用 Filter 统一异常处理：

- **成功响应拦截器**：`src/common/interceptors/success.interceptor.ts`
- **异常过滤器**：`src/common/filters/http-exception.filter.ts`

---

**许可证**: MIT

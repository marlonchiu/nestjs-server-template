# NestJS 项目开发任务规格文档

## 摘要

| 项目 | 描述 |
|------|------|
| 项目名称 | NestJS 服务框架 |
| 版本 | 1.0 |
| 任务总数 | 35 个任务 |
| 关键路径 | 项目初始化 -> 环境配置 -> 数据库模块 -> 公共模块 -> 业务模块 -> 根模块配置 |

### 关键路径说明

项目的关键开发路径为：
1. **项目初始化** (任务 1-4)：搭建项目基础结构
2. **环境配置** (任务 5-7)：配置数据库和应用环境
3. **数据库模块** (任务 8-12)：定义实体和数据库连接
4. **公共模块** (任务 13-21)：实现拦截器、过滤器、守卫等
5. **业务模块** (任务 22-31)：实现 Auth、User、Order 三个模块
6. **根模块配置** (任务 32-34)：组装应用和配置 Swagger

---

## 任务列表

### 阶段一：项目初始化

#### 任务 1: 创建 package.json

**实现步骤**:
1. 创建 package.json 文件
2. 配置项目基本信息（name, version, description）
3. 添加核心依赖：@nestjs/core, @nestjs/common, @nestjs/platform-express, @nestjs/config
4. 添加 TypeScript 依赖：typescript, @types/node, ts-node, nest-cli
5. 添加 Drizzle 依赖：drizzle-orm, drizzle-kit
6. 添加 PostgreSQL 驱动：pg
7. 添加 Swagger 依赖：@nestjs/swagger, swagger-ui-express
8. 添加验证依赖：class-validator, class-transformer
9. 添加工具依赖：bcrypt, jsonwebtoken, @types/bcrypt, @types/jsonwebtoken
10. 添加开发依赖：jest, @types/jest, ts-jest, @nestjs/testing
11. 配置 scripts：build, start, start:dev, start:prod, test, db:push, db:generate, db:migrate

**测试用例**:
- 运行 `npm install` 验证依赖安装成功
- 运行 `npm run build` 验证项目编译成功

**依赖关系**: 无

---

#### 任务 2: 创建 tsconfig.json

**实现步骤**:
1. 创建 tsconfig.json 文件
2. 配置 compilerOptions：
   - target: ES2021
   - module: commonjs
   - lib: ES2021
   - outDir: ./dist
   - rootDir: ./src
   - strict: true
   - esModuleInterop: true
   - skipLibCheck: true
   - forceConsistentCasingInFileNames: true
   - experimentalDecorators: true
   - emitDecoratorMetadata: true
   - resolveJsonModule: true
   - moduleResolution: node
3. 配置 include 和 exclude 路径

**测试用例**:
- 运行 `npx tsc --noEmit` 验证 TypeScript 配置正确

**依赖关系**: 依赖任务 1

---

#### 任务 3: 创建 nest-cli.json

**实现步骤**:
1. 创建 nest-cli.json 文件
2. 配置 collection: @nestjs/schematics
3. 配置 sourceRoot: src
4. 配置 compilerOptions：
   - deleteOutDir: true
   - webpack: false
   - tsConfigPath: tsconfig.json

**测试用例**:
- 运行 `npx nest build` 验证 NestJS 项目编译成功

**依赖关系**: 依赖任务 1、2

---

#### 任务 4: 创建 drizzle.config.ts

**实现步骤**:
1. 创建 drizzle.config.ts 文件
2. 导入 defineConfig 从 drizzle-kit
3. 配置 schema 路径：./src/modules/**/entities/*.entity.ts
4. 配置 out 路径：./src/database/migrations
5. 配置 dialect: postgresql
6. 配置 dbCredentials 从环境变量 DATABASE_URL

**测试用例**:
- 运行 `npx drizzle-kit --version` 验证 Drizzle CLI 可用

**依赖关系**: 依赖任务 1

---

### 阶段二：环境配置

#### 任务 5: 创建 .env.example

**实现步骤**:
1. 创建 .env.example 文件
2. 添加数据库配置项：
   - PG_HOST=localhost
   - PG_PORT=5432
   - PG_USERNAME=postgres
   - PG_PASSWORD=your_password
   - PG_DATABASE=nestjs_app
3. 添加应用配置项：
   - PORT=3000
   - NODE_ENV=development
4. 添加 JWT 配置项：
   - JWT_SECRET=your-super-secret-jwt-key
   - JWT_EXPIRES_IN=7d

**测试用例**:
- 验证文件格式正确，无敏感信息

**依赖关系**: 无

---

#### 任务 6: 创建 .env

**实现步骤**:
1. 复制 .env.example 为 .env
2. 替换实际配置值（开发环境使用本地数据库）
3. 确保 JWT_SECRET 使用安全的随机字符串

**测试用例**:
- 验证应用能读取配置

**依赖关系**: 依赖任务 5

---

#### 任务 7: 创建 configuration.ts

**实现步骤**:
1. 创建 src/config/configuration.ts 文件
2. 导出默认配置函数
3. 配置 port 从 PORT 环境变量读取
4. 配置 database 对象：
   - host: PG_HOST
   - port: PG_PORT（转换为数字）
   - username: PG_USERNAME
   - password: PG_PASSWORD
   - database: PG_DATABASE
5. 配置 jwt 对象：
   - secret: JWT_SECRET
   - expiresIn: JWT_EXPIRES_IN
6. 配置 nodeEnv: NODE_ENV

**测试用例**:
- 验证配置正确加载
- 验证类型安全

**依赖关系**: 依赖任务 5、6

---

### 阶段三：数据库模块

#### 任务 8: 创建 User 实体

**实现步骤**:
1. 创建 src/modules/user/entities/user.entity.ts 文件
2. 导入 pgTable, uuid, varchar, timestamp, serial 从 drizzle-orm/pg-core
3. 创建 users 表：
   - id: uuid 类型，主键，默认 uuid_generate_v4()
   - email: varchar(255) 类型，唯一
   - password: varchar(255) 类型
   - name: varchar(100) 类型，可选
   - role: enum 类型，值为 'user' | 'admin'，默认 'user'
   - createdAt: timestamp 类型，默认 now()
   - updatedAt: timestamp 类型，默认 now()
4. 导出 users 表定义
5. 导出 User 类型

**测试用例**:
- 验证实体定义符合数据字典规范
- 验证字段类型正确

**依赖关系**: 依赖任务 4、7

---

#### 任务 9: 创建 Order 实体

**实现步骤**:
1. 创建 src/modules/order/entities/order.entity.ts 文件
2. 导入 pgTable, uuid, decimal, timestamp, jsonb, pgEnum 从 drizzle-orm/pg-core
3. 创建 orderStatus 枚举：pending, paid, shipped, completed, cancelled
4. 创建 orders 表：
   - id: uuid 类型，主键，默认 uuid_generate_v4()
   - userId: uuid 类型，外键关联 users.id
   - totalAmount: decimal(10,2) 类型
   - status: enum 类型，默认 'pending'
   - items: jsonb 类型，默认 []
   - createdAt: timestamp 类型，默认 now()
   - updatedAt: timestamp 类型，默认 now()
5. 导出 orders 表定义
6. 导出 Order 类型

**测试用例**:
- 验证实体定义符合数据字典规范
- 验证外键关系正确

**依赖关系**: 依赖任务 4、7、8

---

#### 任务 10: 创建数据库 schema 索引

**实现步骤**:
1. 创建 src/database/schema.ts 文件
2. 导入 users 实体
3. 导入 orders 实体
4. 导出所有实体
5. 导出类型：User, Order

**测试用例**:
- 验证所有实体正确导出

**依赖关系**: 依赖任务 8、9

---

#### 任务 11: 创建数据库连接

**实现步骤**:
1. 创建 src/database/database.module.ts 文件
2. 导入 Module, Global 装饰器
3. 导入 ConfigService
4. 导入 drizzle-orm 和 pg
5. 创建 DrizzleProvider：
   - 从 ConfigService 获取数据库配置
   - 创建 pg.Client
   - 创建 Drizzle 实例
6. 创建 DatabaseModule：
   - 使用 @Global() 装饰器
   - 提供 drizzle provider
   - 导出 drizzle
7. 导出 DATABASE_CONNECTION 符号

**测试用例**:
- 验证数据库连接成功
- 验证模块导出正确

**依赖关系**: 依赖任务 7、10

---

#### 任务 12: 创建数据库索引文件

**实现步骤**:
1. 创建 src/database/index.ts 文件
2. 导出 database 模块
3. 导出 schema

**测试用例**:
- 验证导出正确

**依赖关系**: 依赖任务 11

---

### 阶段四：公共模块

#### 任务 13: 创建成功响应拦截器

**实现步骤**:
1. 创建 src/common/interceptors/success.interceptor.ts 文件
2. 导入 Injectable, NestInterceptor, ExecutionContext, CallHandler 装饰器
3. 导入 Observable, map 函数
4. 定义 Response 接口：
   - success: boolean
   - data: T
   - message?: string
5. 实现 SuccessInterceptor 类：
   - 实现 intercept 方法
   - 使用 map 操作符转换响应数据
   - 添加默认消息 "操作成功"
6. 导出 SuccessInterceptor

**测试用例**:
- 验证响应格式符合规范
- 验证拦截器正确包装数据

**依赖关系**: 无

---

#### 任务 14: 创建 Transform 拦截器（可选）

**实现步骤**:
1. 创建 src/common/interceptors/transform.interceptor.ts 文件
2. 导入必要的装饰器和类
3. 实现 TransformInterceptor 类
4. 实现数据转换逻辑

**测试用例**:
- 验证数据转换正确

**依赖关系**: 依赖任务 13

---

#### 任务 15: 创建 HTTP 异常过滤器

**实现步骤**:
1. 创建 src/common/filters/http-exception.filter.ts 文件
2. 导入 ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus 装饰器
3. 导入 Response 类型
4. 实现 HttpExceptionFilter 类：
   - 使用 @Catch() 装饰器捕获所有异常
   - 实现 catch 方法
   - 判断异常类型（HttpException 或其他）
   - 提取错误消息和状态码
   - 返回统一错误格式：
     - success: false
     - error: 错误描述
     - statusCode: 状态码
5. 导出 HttpExceptionFilter

**测试用例**:
- 验证错误响应格式符合规范
- 验证不同异常类型处理正确

**依赖关系**: 无

---

#### 任务 16: 创建 Auth 守卫

**实现步骤**:
1. 创建 src/common/guards/auth.guard.ts 文件
2. 导入 Injectable, CanActivate, ExecutionContext 装饰器
3. 导入 UnauthorizedException
4. 导入 JwtService
5. 导入 Reflector
6. 实现 AuthGuard 类：
   - 实现 canActivate 方法
   - 从请求头提取 Bearer Token
   - 验证 JWT Token
   - 将用户信息附加到请求对象
   - 返回 true 或抛出异常

**测试用例**:
- 验证 Token 验证正确
- 验证未授权请求被拒绝

**依赖关系**: 依赖任务 7

---

#### 任务 17: 创建验证管道

**实现步骤**:
1. 创建 src/common/pipes/validation.pipe.ts 文件
2. 导入 PipeTransform, Injectable, ArgumentMetadata, BadRequestException 装饰器
3. 导入 plainToInstance, validate 函数
4. 实现 ValidationPipe 类：
   - 实现 transform 方法
   - 使用 plainToInstance 转换数据
   - 使用 validate 验证数据
   - 抛出 BadRequestException 如果验证失败
5. 导出 ValidationPipe

**测试用例**:
- 验证 DTO 验证规则正确
- 验证验证失败时抛出正确异常

**依赖关系**: 无

---

#### 任务 18: 创建 Current User 装饰器

**实现步骤**:
1. 创建 src/common/decorators/current-user.decorator.ts 文件
2. 导入 createParamDecorator, ExecutionContext 装饰器
3. 实现 CurrentUserDecorator 类：
   - 实现 factory 方法
   - 从请求对象提取用户信息
4. 导出 CurrentUser

**测试用例**:
- 验证装饰器正确提取用户信息

**依赖关系**: 依赖任务 16

---

#### 任务 19: 创建公共模块索引

**实现步骤**:
1. 创建 src/common/index.ts 文件
2. 导出所有公共模块：
   - interceptors
   - filters
   - guards
   - pipes
   - decorators

**测试用例**:
- 验证导出正确

**依赖关系**: 依赖任务 13-18

---

#### 任务 20: 创建工具函数 - Hash 工具

**实现步骤**:
1. 创建 src/utils/hash.util.ts 文件
2. 导入 bcrypt 的 hash, compare 函数
3. 导出 hashPassword 函数：使用 bcrypt.hash
4. 导出 comparePassword 函数：使用 bcrypt.compare

**测试用例**:
- 验证密码加密和解密正确

**依赖关系**: 无

---

#### 任务 21: 创建工具函数索引

**实现步骤**:
1. 创建 src/utils/index.ts 文件
2. 导出所有工具函数

**测试用例**:
- 验证导出正确

**依赖关系**: 依赖任务 20

---

### 阶段五：Auth 模块

#### 任务 22: 创建 Auth DTO

**实现步骤**:
1. 创建 src/modules/auth/dto/login.dto.ts 文件
   - 导入 IsEmail, IsString, IsNotEmpty, MinLength 装饰器
   - 定义 LoginDto 类：
     - email: string，带 @IsEmail() 验证
     - password: string，带 @IsNotEmpty() 验证
2. 创建 src/modules/auth/dto/register.dto.ts 文件
   - 导入验证装饰器
   - 定义 RegisterDto 类：
     - email: string，带 @IsEmail() 验证
     - password: string，带 @MinLength(6) 验证
     - name?: string，带 @IsString() 验证
3. 导出 LoginDto 和 RegisterDto

**测试用例**:
- 验证 DTO 验证规则正确
- 验证 Swagger 文档正确生成

**依赖关系**: 依赖任务 13-18

---

#### 任务 23: 创建 Auth Service

**实现步骤**:
1. 创建 src/modules/auth/auth.service.ts 文件
2. 导入 Injectable 装饰器
3. 导入 ConfigService, JwtService
4. 导入 DbInterface
5. 导入 { users } 表定义
6. 导入 hashPassword, comparePassword 工具函数
7. 导入 LoginDto, RegisterDto
8. 导入 UnauthorizedException, ConflictException
9. 实现 AuthService 类：
   - register 方法：
     - 检查邮箱是否已存在
     - 加密密码
     - 插入用户数据
     - 返回用户信息（不包含密码）
   - login 方法：
     - 查找用户
     - 验证密码
     - 生成 JWT Token
     - 返回 Token 和用户信息

**测试用例**:
- 验证用户注册成功
- 验证用户登录成功
- 验证重复注册被拒绝
- 验证错误密码被拒绝

**依赖关系**: 依赖任务 8、20、21

---

#### 任务 24: 创建 Auth Controller

**实现步骤**:
1. 创建 src/modules/auth/auth.controller.ts 文件
2. 导入 Controller, Post, Body, HttpCode, HttpStatus 装饰器
3. 导入 ApiTags, ApiOperation, ApiResponse 装饰器
4. 导入 LoginDto, RegisterDto
5. 导入 AuthService
6. 实现 AuthController 类：
   - POST /auth/register：
     - @Post('register')
     - @ApiOperation({ summary: '用户注册' })
     - 调用 AuthService.register
   - POST /auth/login：
     - @Post('login')
     - @HttpCode(HttpStatus.OK)
     - @ApiOperation({ summary: '用户登录' })
     - 调用 AuthService.login

**测试用例**:
- 验证注册接口返回正确格式
- 验证登录接口返回 Token

**依赖关系**: 依赖任务 22、23

---

#### 任务 25: 创建 Auth 模块

**实现步骤**:
1. 创建 src/modules/auth/auth.module.ts 文件
2. 导入 Module 装饰器
3. 导入 ConfigService
4. 导入 JwtService
5. 导入 AuthController
6. 导入 AuthService
7. 实现 AuthModule 类：
   - 导入 ConfigModule
   - 提供 JwtService（使用 ConfigService）
   - 提供 AuthService
   - 导出 AuthService
   - 导出 JwtService

**测试用例**:
- 验证模块正确配置

**依赖关系**: 依赖任务 23、24

---

### 阶段六：User 模块

#### 任务 26: 创建 User DTO

**实现步骤**:
1. 创建 src/modules/user/dto/create-user.dto.ts 文件
   - 导入验证装饰器
   - 定义 CreateUserDto 类：
     - email: string
     - password: string
     - name?: string
     - role?: 'user' | 'admin'
2. 创建 src/modules/user/dto/update-user.dto.ts 文件
   - 导入 PartialType, OmitType 装饰器
   - 使用 OmitType 排除不可更新字段
   - 定义 UpdateUserDto 类
3. 导出 CreateUserDto 和 UpdateUserDto

**测试用例**:
- 验证 DTO 验证规则正确

**依赖关系**: 依赖任务 13-18

---

#### 任务 27: 创建 User Service

**实现步骤**:
1. 创建 src/modules/user/user.service.ts 文件
2. 导入 Injectable, NotFoundException 装饰器
3. 导入 DbInterface
4. 导入 { users } 表定义
5. 导入 hashPassword 工具函数
6. 导入 CreateUserDto, UpdateUserDto
7. 实现 UserService 类：
   - findAll 方法：返回用户列表（排除密码）
   - findOne 方法：根据 ID 查找用户
   - create 方法：创建新用户
   - update 方法：更新用户信息
   - remove 方法：删除用户

**测试用例**:
- 验证用户 CRUD 操作正确

**依赖关系**: 依赖任务 8、20、21

---

#### 任务 28: 创建 User Controller

**实现步骤**:
1. 创建 src/modules/user/user.controller.ts 文件
2. 导入 Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe 装饰器
3. 导入 ApiTags, ApiOperation, ApiResponse 装饰器
4. 导入 UseGuards 装饰器
5. 导入 CreateUserDto, UpdateUserDto
6. 导入 UserService
7. 导入 AuthGuard
8. 实现 UserController 类：
   - GET /users：获取用户列表
   - GET /users/:id：获取用户详情
   - POST /users：创建用户
   - PATCH /users/:id：更新用户
   - DELETE /users/:id：删除用户
   - 所有路由使用 @UseGuards(AuthGuard)

**测试用例**:
- 验证 CRUD 接口正确
- 验证认证守卫工作

**依赖关系**: 依赖任务 26、27

---

#### 任务 29: 创建 User 模块

**实现步骤**:
1. 创建 src/modules/user/user.module.ts 文件
2. 导入 Module 装饰器
3. 导入 UserController
4. 导入 UserService
5. 实现 UserModule 类：
   - 提供 UserService
   - 导出 UserService

**测试用例**:
- 验证模块正确配置

**依赖关系**: 依赖任务 27、28

---

### 阶段七：Order 模块

#### 任务 30: 创建 Order DTO

**实现步骤**:
1. 创建 src/modules/order/dto/create-order.dto.ts 文件
   - 导入验证装饰器
   - 定义 OrderItem 接口
   - 定义 CreateOrderDto 类：
     - userId: string (UUID)
     - totalAmount: number
     - items: OrderItem[]
2. 创建 src/modules/order/dto/update-order.dto.ts 文件
   - 导入 PartialType
   - 定义 UpdateOrderDto 类
3. 导出 CreateOrderDto 和 UpdateOrderDto

**测试用例**:
- 验证 DTO 验证规则正确

**依赖关系**: 依赖任务 13-18

---

#### 任务 31: 创建 Order Service

**实现步骤**:
1. 创建 src/modules/order/order.service.ts 文件
2. 导入 Injectable, NotFoundException 装饰器
3. 导入 DbInterface
4. 导入 { orders } 表定义
5. 导入 CreateOrderDto, UpdateOrderDto
6. 实现 OrderService 类：
   - findAll 方法：返回订单列表
   - findOne 方法：根据 ID 查找订单
   - create 方法：创建新订单
   - update 方法：更新订单状态
   - remove 方法：删除订单

**测试用例**:
- 验证订单 CRUD 操作正确

**依赖关系**: 依赖任务 9

---

#### 任务 32: 创建 Order Controller

**实现步骤**:
1. 创建 src/modules/order/order.controller.ts 文件
2. 导入必要的装饰器
3. 导入 ApiTags, ApiOperation 装饰器
4. 导入 UseGuards 装饰器
5. 导入 CreateOrderDto, UpdateOrderDto
6. 导入 OrderService
7. 导入 AuthGuard
8. 实现 OrderController 类：
   - GET /orders：获取订单列表
   - GET /orders/:id：获取订单详情
   - POST /orders：创建订单
   - PATCH /orders/:id：更新订单
   - DELETE /orders/:id：删除订单
   - 所有路由使用 @UseGuards(AuthGuard)

**测试用例**:
- 验证 CRUD 接口正确
- 验证认证守卫工作

**依赖关系**: 依赖任务 30、31

---

#### 任务 33: 创建 Order 模块

**实现步骤**:
1. 创建 src/modules/order/order.module.ts 文件
2. 导入 Module 装饰器
3. 导入 OrderController
4. 导入 OrderService
5. 实现 OrderModule 类：
   - 提供 OrderService
   - 导出 OrderService

**测试用例**:
- 验证模块正确配置

**依赖关系**: 依赖任务 31、32

---

### 阶段八：根模块和主配置

#### 任务 34: 创建 AppModule

**实现步骤**:
1. 创建 src/app.module.ts 文件
2. 导入 Module, ConfigModule 装饰器
3. 导入 DatabaseModule
4. 导入 AuthModule
5. 导入 UserModule
6. 导入 OrderModule
7. 实现 AppModule 类：
   - 导入 ConfigModule.forRoot()
   - 导入 DatabaseModule
   - 导入 AuthModule
   - 导入 UserModule
   - 导入 OrderModule

**测试用例**:
- 验证所有模块正确导入

**依赖关系**: 依赖任务 11、25、29、33

---

#### 任务 35: 创建 main.ts

**实现步骤**:
1. 创建 src/main.ts 文件
2. 导入 NestFactory 函数
3. 导入 SwaggerModule, DocumentBuilder 从 @nestjs/swagger
4. 导入 ValidationPipe 从 @nestjs/common
5. 导入 AppModule
6. 导入 HttpExceptionFilter
7. 导入 SuccessInterceptor
8. 实现 bootstrap 函数：
   - 创建 NestFactory 实例
   - 设置全局前缀 /api
   - 配置 Swagger：
     - setTitle: 'NestJS Server API'
     - setDescription: '服务框架 API 文档'
     - setVersion: '1.0'
     - addBearerAuth()
     - 设置路由为 /api/docs
   - 配置全局管道：ValidationPipe
   - 配置全局拦截器：SuccessInterceptor
   - 配置全局过滤器：HttpExceptionFilter
   - 监听端口从环境变量 PORT

**测试用例**:
- 验证 Swagger 文档可访问
- 验证全局配置生效

**依赖关系**: 依赖任务 14、15、19、34

---

## 任务依赖图

```
                          +---------------------------------------------------------------------+
                          |                              阶段一：项目初始化                        |
                          |  T1 --> T2 --> T3 --> T4                                             |
                          |  package -> tsconfig -> nest-cli -> drizzle.config                  |
                          +---------------------------------------------------------------------+

                                                    |
                                                    v

                          +---------------------------------------------------------------------+
                          |                              阶段二：环境配置                          |
                          |  T5 --> T6 --> T7                                                     |
                          |  .env.example -> .env -> configuration.ts                             |
                          +---------------------------------------------------------------------+

                                                    |
                                                    v

                          +---------------------------------------------------------------------+
                          |                              阶段三：数据库模块                         |
                          |  T8 --> T9 --> T10 --> T11 --> T12                                   |
                          |  User entity -> Order entity -> schema -> module -> index            |
                          +---------------------------------------------------------------------+

                                                    |
                                                    v

                          +---------------------------------------------------------------------+
                          |                              阶段四：公共模块                           |
                          |  T13 --> T14 --> T15 --> T16 --> T17 --> T18 --> T19                |
                          |  interceptors -> filters -> guards -> pipes -> decorators -> index    |
                          |  T20 --> T21                                                         |
                          |  hash util -> utils index                                             |
                          +---------------------------------------------------------------------+

                                                    |
                                                    v

                          +---------------------------------------------------------------------+
                          |                              阶段五：Auth 模块                         |
                          |  T22 --> T23 --> T24 --> T25                                        |
                          |  DTO -> service -> controller -> module                              |
                          +---------------------------------------------------------------------+

                                                    |
                                                    v

                          +---------------------------------------------------------------------+
                          |                              阶段六：User 模块                         |
                          |  T26 --> T27 --> T28 --> T29                                        |
                          |  DTO -> service -> controller -> module                              |
                          +---------------------------------------------------------------------+

                                                    |
                                                    v

                          +---------------------------------------------------------------------+
                          |                              阶段七：Order 模块                       |
                          |  T30 --> T31 --> T32 --> T33                                        |
                          |  DTO -> service -> controller -> module                              |
                          +---------------------------------------------------------------------+

                                                    |
                                                    v

                          +---------------------------------------------------------------------+
                          |                          阶段八：根模块配置                           |
                          |  T34 --> T35                                                         |
                          |  app.module -> main.ts                                               |
                          +---------------------------------------------------------------------+
```

---

## 附录

### 关键里程碑

| 里程碑 | 任务 | 描述 |
|--------|------|------|
| M1 | T1-T4 | 项目基础结构搭建完成 |
| M2 | T5-T7 | 环境配置完成 |
| M3 | T8-T12 | 数据库模块完成 |
| M4 | T13-T21 | 公共模块完成 |
| M5 | T22-T25 | Auth 模块完成 |
| M6 | T26-T29 | User 模块完成 |
| M7 | T30-T33 | Order 模块完成 |
| M8 | T34-T35 | 应用启动配置完成 |

### 数据库同步命令

项目完成后，使用以下命令同步数据库：

```bash
# 推送 schema 到数据库
npm run db:push

# 生成迁移文件（可选）
npm run db:generate

# 执行迁移（可选）
npm run db:migrate
```

### Swagger 文档访问

应用启动后，访问以下地址查看 API 文档：

- 本地开发环境：http://localhost:3000/api/docs

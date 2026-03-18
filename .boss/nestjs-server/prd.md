# 产品需求文档 (PRD)

## 文档信息
- **功能名称**：NestJS 服务框架
- **版本**：1.0
- **创建日期**：2026-03-17
- **作者**：Architect Agent
- **状态**：已批准

## 摘要

> 下游 Agent 请优先阅读本节，需要细节时再查阅完整文档。

- **核心目标**：搭建一个基于 NestJS + PostgreSQL + Drizzle 的 RESTful API 服务框架
- **目标用户**：后端开发人员
- **关键功能**：
  1. 用户认证模块 (Auth)
  2. 用户管理模块 (User)
  3. 订单业务模块 (Order)
  4. 统一响应格式 (Interceptor + Filter)
  5. Swagger API 文档
- **技术约束**：
  - Node.js/TypeScript + NestJS 框架
  - PostgreSQL 数据库 + Drizzle ORM
  - 使用 .env 管理配置
- **优先级**：MVP - 完整的 CRUD + 认证基础功能

---

## 1. 概述

### 1.1 背景
需要一个标准化的 Node.js 后端服务框架，用于快速搭建业务应用。该框架需要遵循 NestJS 官方最佳实践，提供清晰的目录结构、统一的响应格式和完善的文档支持。

### 1.2 目标
- 建立统一的 NestJS 项目脚手架
- 集成 Drizzle ORM 与 PostgreSQL
- 实现 auth、user、order 三个业务模块
- 统一 API 响应格式
- 提供 Swagger 接口文档
- 支持数据库 schema 同步

### 1.3 成功指标
- [ ] 项目可正常启动并连接数据库
- [ ] 三个业务模块的 CRUD 接口可正常工作
- [ ] Swagger 文档可访问并显示所有接口
- [ ] 数据库 schema 可通过 drizzle-kit 同步

---

## 2. 用户画像

### 用户画像：后端开发工程师
| 属性 | 描述 |
|------|------|
| 角色 | 后端开发工程师 |
| 特征 | 熟悉 TypeScript，了解 RESTful API 设计 |
| 需求 | 快速搭建服务框架，减少样板代码 |
| 痛点 | 重复搭建项目结构，统一响应格式繁琐 |
| 期望 | 开箱即用，遵循最佳实践，易于扩展 |

---

## 3. 功能需求

### FR-001：项目初始化
- **描述**：创建 NestJS 项目并集成 Drizzle ORM
- **优先级**：必须有
- **依赖**：Node.js、PostgreSQL
- **验收标准**：
  - [ ] 项目可通过 `npm run start` 启动
  - [ ] 可通过 .env 配置数据库连接
  - [ ] 目录结构符合 NestJS 官方规范

### FR-002：统一响应格式
- **描述**：使用 Interceptor 和 Filter 统一 API 响应格式
- **优先级**：必须有
- **依赖**：FR-001
- **验收标准**：
  - [ ] 成功响应格式：`{ success: true, data: any, message?: string }`
  - [ ] 错误响应格式：`{ success: false, error: string, statusCode: number }`
  - [ ] HTTP 异常会被统一捕获并格式化

### FR-003：用户认证模块 (Auth)
- **描述**：提供用户注册、登录功能
- **优先级**：必须有
- **依赖**：FR-001
- **验收标准**：
  - [ ] POST /api/auth/register - 用户注册
  - [ ] POST /api/auth/login - 用户登录
  - [ ] 密码需要加密存储

### FR-004：用户管理模块 (User)
- **描述**：提供用户信息的 CRUD 操作
- **优先级**：必须有
- **依赖**：FR-003
- **验收标准**：
  - [ ] GET /api/users - 获取用户列表
  - [ ] GET /api/users/:id - 获取用户详情
  - [ ] PATCH /api/users/:id - 更新用户信息
  - [ ] DELETE /api/users/:id - 删除用户

### FR-005：订单业务模块 (Order)
- **描述**：提供订单的 CRUD 操作
- **优先级**：必须有
- **依赖**：FR-003, FR-004
- **验收标准**：
  - [ ] GET /api/orders - 获取订单列表
  - [ ] GET /api/orders/:id - 获取订单详情
  - [ ] POST /api/orders - 创建订单
  - [ ] PATCH /api/orders/:id - 更新订单
  - [ ] DELETE /api/orders/:id - 删除订单

### FR-006：Swagger API 文档
- **描述**：集成 Swagger 生成 API 文档
- **优先级**：应该有
- **依赖**：FR-002
- **验收标准**：
  - [ ] 访问 /api/docs 可查看 Swagger 界面
  - [ ] 所有接口都有完整的注释和示例

### FR-007：数据库同步
- **描述**：使用 drizzle-kit 同步数据库 schema
- **优先级**：应该有
- **依赖**：FR-001
- **验收标准**：
  - [ ] 可通过 `npm run db:push` 同步 schema
  - [ ] 可通过 `npm run db:generate` 生成迁移文件

---

## 4. 非功能需求

### NFR-001：代码规范
- **类型**：代码质量
- **描述**：使用 ESLint 和 Prettier 统一代码风格
- **指标**：通过 CI lint 检查

### NFR-002：类型安全
- **类型**：代码质量
- **描述**：TypeScript 严格模式，开启 strictNullChecks
- **指标**：无 any 类型泄漏

### NFR-003：模块化设计
- **类型**：可维护性
- **描述**：每个业务模块独立目录，符合 NestJS 模块化原则
- **指标**：模块间低耦合

---

## 5. DTO 和 Entity 命名规范

### 命名约定
- DTO 文件：`xxx.dto.ts`
- Entity 文件：`xxx.entity.ts`
- 放在各自模块的 `dto/` 和 `entities/` 目录下

### 示例
```
src/
├── modules/
│   ├── auth/
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   └── register.dto.ts
│   │   └── entities/
│   │       └── user.entity.ts
│   ├── user/
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   └── update-user.dto.ts
│   │   └── entities/
│   │       └── user.entity.ts
│   └── order/
│       ├── dto/
│       │   ├── create-order.dto.ts
│       │   └── update-order.dto.ts
│       └── entities/
│           └── order.entity.ts
```

---

## 6. 范围定义

### 6.1 范围内
- NestJS 项目初始化
- Drizzle ORM 集成
- auth 模块（注册、登录）
- user 模块（CRUD）
- order 模块（CRUD）
- Interceptor 统一响应
- Filter 异常处理
- Swagger 文档
- 数据库配置管理

### 6.2 范围外
- 微服务架构
- 缓存层实现
- 消息队列集成
- 文件上传功能
- 第三方登录（OAuth）

---

## 7. 风险与依赖

### 7.1 风险
| 风险 | 可能性 | 影响 | 缓解措施 |
|------|--------|------|----------|
| Drizzle 与 NestJS 集成复杂度 | 中 | 中 | 参考官方文档和社区最佳实践 |
| 数据库连接配置错误 | 低 | 高 | 提供详细的 .env 配置说明 |

### 7.2 依赖
| 依赖项 | 类型 | 状态 | 负责人 |
|--------|------|------|--------|
| Node.js >= 18 | 技术 | 就绪 | 开发人员 |
| PostgreSQL >= 14 | 技术 | 待定 | 运维人员 |

---

## 8. 开放问题

- [ ] 认证模块的 JWT 密钥管理策略
- [ ] 是否需要实现 Refresh Token 机制
- [ ] 日志系统的具体实现方案

---

## 变更记录

| 版本 | 日期 | 作者 | 变更内容 |
|------|------|------|----------|
| 1.0 | 2026-03-17 | Architect Agent | 初始版本 |

# 搭建一个服务框架

- 使用Node.js/TypeScript, nestjs 框架，PostgreSQL 数据库，集成 drizzle，RESTful API
- 包含 auth、 user、order（一个业务模块） 三个服务控制器 ，使用interceptor和filter统一路由返回格式
- 架构清晰，参考nestjs 官方目录结构
- 数据库的配置 放在 .env中。包含 `PG_HOST、PG_PORT、PG_USERNAME、PG_PASSWORD、PG_DATABASE`
- 提供文档说明，包含数据库同步、swagger接口文档、
- xxx.dto.ts 定义数据传输对象、xxx.entity.ts定义实例包含字段属性定义

import 'dotenv-safe/config'; // 加载 .env 并验证必需变量
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LogsService } from './logs/logs.service';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // 使用自定义日志服务
  app.useLogger(app.get(LogsService));

  // 全局前缀
  app.setGlobalPrefix('api');

  // CORS 配置
  app.enableCors({
    origin: process.env.CORS_ORIGIN || true, // 允许所有来源，或配置具体的域名
    credentials: true,
  });

  // 全局管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // 全局过滤器 - 在 NestJS 10.x 中通过 APP_FILTER 使用
  // 已在 LogsModule 中注册

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

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}/api`);
  if (process.env.NODE_ENV !== 'production') {
    logger.log(`Swagger documentation: http://localhost:${port}/api/docs`);
  }
}
bootstrap();

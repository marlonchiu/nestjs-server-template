import { Module, Global, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

// 导出数据库类型供 Service 使用
export type Database = NodePgDatabase<typeof schema>;

let pool: Pool | null = null;

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: (configService: ConfigService): Database => {
        pool = new Pool({
          host: configService.get<string>('database.host'),
          port: configService.get<number>('database.port'),
          user: configService.get<string>('database.username'),
          password: configService.get<string>('database.password'),
          database: configService.get<string>('database.database'),
          // 连接池配置
          max: 20,                    // 最大连接数
          idleTimeoutMillis: 30000,   // 空闲连接超时 30 秒
          connectionTimeoutMillis: 2000, // 连接超时 2 秒
        });

        return drizzle(pool, { schema });
      },
      inject: [ConfigService],
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule implements OnModuleDestroy {
  async onModuleDestroy() {
    if (pool) {
      await pool.end();
    }
  }
}

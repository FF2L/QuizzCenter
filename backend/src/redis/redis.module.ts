// src/redis/redis.module.ts
import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS',
      useFactory: () => {
        const url = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
        return new Redis(url, {
          // optional: tls, retryStrategy...
        });
      },
    },
  ],
  exports: ['REDIS'],
})
export class RedisModule {}

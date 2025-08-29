import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from './logger/logger.module';
import { UtilsModule } from './utils/utils.module';
import { IdempotencyModule } from './idempotency/key-guard/idempotency.module';
import { UsersModule } from './modules';
import { RedisModule } from './redis/redis.module';
import { DbModule } from './db/db.module';
import { S3Module } from './s3/s3.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: (() => {
                switch (process.env.NODE_ENV) {
                    case 'production':
                        return '.env.production';
                    case 'development':
                        return '.env.development';
                    case 'local':
                        return '.env.local';
                    default:
                        return '.env';
                }
            })(),
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get('DB_HOST', 'localhost'),
                port: configService.get<number>('DB_PORT', 3306),
                username: configService.get('DB_USERNAME', 'root'),
                password: configService.get('DB_PASSWORD', 'password'),
                database: configService.get('DB_NAME', 'harpic_sanitation_db'),
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: false,
                logging: configService.get('NODE_ENV') !== 'production',
                charset: 'utf8mb4',
                timezone: 'Z',
                cache: {
                    duration: 30000,
                },
                extra: {
                    connectionLimit: 10,
                },
            }),
        }),
        LoggerModule,
        UsersModule,
        AuthModule,
        UtilsModule,
        IdempotencyModule,
        RedisModule,
        DbModule,
        S3Module,
    ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from './logger/logger.module';
import { UtilsModule } from './utils/utils.module';
import { IdempotencyModule } from './idempotency/idempotency.module';
import {
    RatingsModule,
    UsersModule,
    OtpsModule,
    CouponsModule,
    PaymentsModule,
    SmsModule,
} from './modules';

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
                    default:
                        return '.env.local';
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
                database: configService.get('DB_DATABASE', 'coupons_db'),
                entities: [__dirname + '/**/*.entity{.ts,.js}'],
                synchronize: configService.get('NODE_ENV') !== 'production',
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
        OtpsModule,
        CouponsModule,
        AuthModule,
        SmsModule,
        PaymentsModule,
        UtilsModule,
        IdempotencyModule,
        RatingsModule,
    ],
})
export class AppModule {}

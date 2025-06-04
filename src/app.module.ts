import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { OtpsModule } from './otps/otps.module';
import { CouponsModule } from './coupons/coupons.module';
import { AuthModule } from './auth/auth.module';
import { LoggerModule } from './logger/logger.module';
import { SmsModule } from './sms/sms.module';
import { PaymentsModule } from './payments/payments.module';
import { UtilsModule } from './utils/utils.module';
import { IdempotencyModule } from './idempotency/idempotency.module';
import { RatingsModule } from './ratings/ratings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
        logging: configService.get('NODE_ENV') === 'development',
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
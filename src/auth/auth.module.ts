import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from 'src/modules/users/users.module';
import { IdempotencyModule } from 'src/idempotency';
import { DistrictsService } from 'src/modules/districts/districts.service';
import { DistrictsModule } from 'src/modules';

@Module({
    imports: [
        UsersModule,
        PassportModule,
        IdempotencyModule,
        DistrictsModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET', 'your-secret-key'),
                signOptions: { expiresIn: '24h' },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, DistrictsService],
    exports: [AuthService, JwtModule],
})
export class AuthModule {}

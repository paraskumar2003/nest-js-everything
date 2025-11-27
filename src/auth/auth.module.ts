import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies/jwt.strategy';
import { IdempotencyModule } from 'src/idempotency';

@Module({
    imports: [
        
        PassportModule,
        IdempotencyModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get('JWT_SECRET', 'your-secret-key'),
                signOptions: { expiresIn: '24h' },
            }),
        }),
    ],
    controllers: [],
    providers: [ JwtStrategy],
    exports: [ JwtModule],
})
export class AuthModule {}

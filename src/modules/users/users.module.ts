import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Otp } from './entities/otp.entity';
import { DistrictsModule } from '../districts/districts.module';
import { IdempotencyModule } from 'src/idempotency/key-guard/idempotency.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Otp]),
        DistrictsModule,
        IdempotencyModule,
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}

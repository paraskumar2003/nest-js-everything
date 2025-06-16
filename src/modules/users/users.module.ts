import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { PaymentsModule } from '../payments/payments.module';
import { IdempotencyModule } from 'src/idempotency/key-guard/idempotency.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        PaymentsModule,
        IdempotencyModule,
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}

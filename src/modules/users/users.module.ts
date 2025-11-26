import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Otp } from './entities/otp.entity';
import { IdempotencyModule } from 'src/idempotency/key-guard/idempotency.module';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoUser, MongoUserSchema } from './schema/user.schema';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Otp]),
        MongooseModule.forFeature([
            { name: MongoUser.name, schema: MongoUserSchema },
        ]),
        IdempotencyModule,
    ],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}

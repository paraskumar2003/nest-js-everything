import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './users.service';
import { UserController } from './users.controller';
import { Otp } from './entities/otp.entity';
import { IdempotencyModule } from 'src/idempotency/key-guard/idempotency.module';
import { MongooseModule } from '@nestjs/mongoose';
import { User, MongoUserSchema } from './schema/user.schema';
import { OtpSchema } from './schema/otp.schema';

const mysqlImports =
    process.env.USE_MYSQL === 'true'
        ? [TypeOrmModule.forFeature([User, Otp])]
        : [];

@Module({
    imports: [
        ...mysqlImports,
        MongooseModule.forFeature([
            { name: User.name, schema: MongoUserSchema },
            { name: Otp.name, schema: OtpSchema },
        ]),
        IdempotencyModule,
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UsersModule {}

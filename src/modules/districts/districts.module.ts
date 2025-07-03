import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DistrictsService } from './districts.service';
import { DistrictsController } from './districts.controller';
import { District } from './entities/district.entity';
import { IdempotencyModule } from 'src/idempotency/key-guard/idempotency.module';

@Module({
    imports: [TypeOrmModule.forFeature([District]), IdempotencyModule],
    controllers: [DistrictsController],
    providers: [DistrictsService],
    exports: [DistrictsService, TypeOrmModule.forFeature([District])],
})
export class DistrictsModule {}

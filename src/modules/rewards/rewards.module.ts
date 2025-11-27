import { Module } from '@nestjs/common';
import { RewardsController } from '../../rewards/rewards.controller';
import { RewardsService } from '../../rewards/rewards.service';

@Module({
  controllers: [RewardsController],
  providers: [RewardsService]
})
export class RewardsModule {}

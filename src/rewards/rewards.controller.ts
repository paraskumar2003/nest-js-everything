import { Body, Controller, Post, Headers } from '@nestjs/common';
import { RewardsService } from './rewards.service';
import { CreateRewardDto } from './dto/rewards.dto';

@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Post('orderPlace')
  createReward(
    @Body() createRewardDto: CreateRewardDto,
    @Headers('authorization') token: string,
  ) {
    return this.rewardsService.orderPlace(createRewardDto, token);
  }
}

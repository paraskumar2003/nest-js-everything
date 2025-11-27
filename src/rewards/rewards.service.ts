import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CreateRewardDto } from './dto/rewards.dto';

@Injectable()
export class RewardsService {

  async orderPlace(createRewardDto: CreateRewardDto, token: string) {
    console.log('aaaaa');
    
    const url = 'https://trapi.vouch.club/orders/orderPlaced';

    try {
      const response = await axios.post(
        url,
        createRewardDto,
        {
          headers: {
            Authorization: token,   
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;  
    } catch (error: any) {
      console.error('OrderPlace API Error:', error.response?.data || error.message);

      throw new Error(error.response?.data?.message || 'OrderPlace API failed');
    }
  }
}

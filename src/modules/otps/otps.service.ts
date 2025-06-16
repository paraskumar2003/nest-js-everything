import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Otp } from './entities/otp.entity';
import { CreateOtpDto } from './dto/create-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { plainToInstance } from 'class-transformer';
import { OtpResponseDto } from './dto/otp-response.dto';

@Injectable()
export class OtpsService {
  constructor(
    @InjectRepository(Otp)
    private readonly otpRepository: Repository<Otp>,
  ) {}

  async create(createOtpDto: CreateOtpDto) {
    const otp = this.otpRepository.create(createOtpDto);
    const savedOtp = await this.otpRepository.save(otp);
    return plainToInstance(OtpResponseDto, savedOtp);
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto) {
    const { mobile, otp } = verifyOtpDto;

    // Find the most recent OTP for this mobile number
    const otpRecord = await this.otpRepository.findOne({
      where: { mobile, otp, verified: false },
      order: { createdAt: 'DESC' },
    });

    if (!otpRecord) {
      return {
        success: false,
        message: 'Invalid OTP or OTP expired',
      };
    }

    // Check if OTP is not too old (e.g., 10 minutes)
    const otpCreationTime = new Date(otpRecord.createdAt).getTime();
    const currentTime = new Date().getTime();
    const tenMinutesInMs = 10 * 60 * 1000;

    if (currentTime - otpCreationTime > tenMinutesInMs) {
      return {
        success: false,
        message: 'OTP has expired',
      };
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    otpRecord.verifiedAt = new Date();
    await this.otpRepository.save(otpRecord);

    return {
      success: true,
      message: 'OTP verified successfully',
    };
  }

  async findAll(filters: { mobile?: string; verified?: boolean } = {}) {
    const queryBuilder = this.otpRepository.createQueryBuilder('otp');

    if (filters.mobile) {
      queryBuilder.andWhere('otp.mobile = :mobile', { mobile: filters.mobile });
    }

    if (filters.verified !== undefined) {
      queryBuilder.andWhere('otp.verified = :verified', { verified: filters.verified });
    }

    const otps = await queryBuilder.getMany();
    return plainToInstance(OtpResponseDto, otps);
  }

  async findOne(id: number) {
    const otp = await this.otpRepository.findOneBy({ id });
    return otp ? plainToInstance(OtpResponseDto, otp) : null;
  }
}
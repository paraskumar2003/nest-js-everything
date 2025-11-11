import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { Otp, OtpStatus } from './entities/otp.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';
import { BaseService } from 'src/common/base.service';

@Injectable()
export class UsersService extends BaseService<User> {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Otp)
        private readonly otpRepository: Repository<Otp>,
    ) {
        super(userRepository);
    }

    async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
        const user = this.userRepository.create(createUserDto);
        const savedUser = await this.userRepository.save(user);
        return plainToInstance(UserResponseDto, savedUser);
    }

    async findAllUsers(
        filters: {
            active?: boolean;
            role?: UserRole;
            districtId?: number;
        } = {},
    ): Promise<UserResponseDto[]> {
        const queryBuilder = this.userRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.district', 'district');

        if (filters.active !== undefined) {
            queryBuilder.andWhere('user.active = :active', {
                active: filters.active,
            });
        }

        if (filters.role) {
            queryBuilder.andWhere('user.role = :role', { role: filters.role });
        }

        if (filters.districtId) {
            queryBuilder.andWhere('user.districtId = :districtId', {
                districtId: filters.districtId,
            });
        }

        const users = await queryBuilder.getMany();
        return plainToInstance(UserResponseDto, users);
    }

    async findByMobile(mobile: string): Promise<UserResponseDto | null> {
        const user = await this.userRepository.findOne({
            where: { mobile },
            relations: ['district'],
        });
        return user ? plainToInstance(UserResponseDto, user) : null;
    }

    async update(
        id: number,
        updateUserDto: UpdateUserDto,
    ): Promise<UserResponseDto | null> {
        const user = await this.userRepository.findOneBy({ id });
        if (!user) {
            return null;
        }

        await this.userRepository.update(id, updateUserDto);
        const updatedUser = await this.userRepository.findOne({
            where: { id },
            relations: ['district'],
        });
        return plainToInstance(UserResponseDto, updatedUser);
    }

    async remove(id: number): Promise<boolean> {
        const result = await this.userRepository.softDelete(id);
        return result.affected > 0;
    }

    // OTP related methods
    async generateOtp(mobile: string): Promise<string> {
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Expire any existing pending OTPs for this mobile
        await this.otpRepository.update(
            { mobile, status: OtpStatus.PENDING },
            { status: OtpStatus.EXPIRED },
        );

        // Create new OTP
        const otpEntity = this.otpRepository.create({
            mobile,
            otp,
            status: OtpStatus.PENDING,
            active: true,
        });

        await this.otpRepository.save(otpEntity);
        return otp;
    }

    async verifyOtp(mobile: string, otp: number): Promise<boolean> {
        const otpEntity = await this.otpRepository.findOne({
            where: {
                mobile,
                otp: otp.toString(),
                status: OtpStatus.PENDING,
                active: true,
            },
        });

        if (!otpEntity) {
            return false;
        }

        // Check if OTP is expired (valid for 10 minutes)
        const otpAge = Date.now() - otpEntity.createdAt.getTime();
        const tenMinutes = 10 * 60 * 1000;

        if (otpAge > tenMinutes) {
            // Mark as expired
            await this.otpRepository.update(otpEntity.id, {
                status: OtpStatus.EXPIRED,
            });
            return false;
        }

        // Mark as verified
        await this.otpRepository.update(otpEntity.id, {
            status: OtpStatus.VERIFIED,
        });

        return true;
    }
}

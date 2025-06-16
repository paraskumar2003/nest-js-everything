import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async create(createUserDto: CreateUserDto) {
        const user = this.userRepository.create(createUserDto);
        const savedUser = await this.userRepository.save(user);
        return plainToInstance(UserResponseDto, savedUser);
    }

    async findAll(filters: { active?: boolean } = {}) {
        const queryBuilder = this.userRepository.createQueryBuilder('user');

        if (filters.active !== undefined) {
            queryBuilder.andWhere('user.active = :active', {
                active: filters.active,
            });
        }

        const users = await queryBuilder.getMany();
        return plainToInstance(UserResponseDto, users);
    }

    async findOne(id: number) {
        const user = await this.userRepository.findOneBy({ id });
        return user ? plainToInstance(UserResponseDto, user) : null;
    }

    async findByMobile(mobile: string) {
        const user = await this.userRepository.findOneBy({ mobile });
        return user ? plainToInstance(UserResponseDto, user) : null;
    }

    async findByUpiId(upiId: string) {
        const user = await this.userRepository.findOneBy({ upiId });
        return user ? plainToInstance(UserResponseDto, user) : null;
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        const user = await this.userRepository.findOneBy({ id });
        if (!user) {
            return null;
        }

        await this.userRepository.update(id, updateUserDto);
        const updatedUser = await this.userRepository.findOneBy({ id });
        return plainToInstance(UserResponseDto, updatedUser);
    }

    async updateUpiId(
        mobile: string,
        upiId: string,
        isCustomUpdate: boolean = false,
    ) {
        // First check if UPI is already registered with another user
        const existingUser = await this.userRepository.findOne({
            where: { upiId },
        });

        if (existingUser && existingUser.mobile !== mobile) {
            return {
                success: false,
                message: 'This UPI is already registered',
            };
        }

        const user = await this.userRepository.findOneBy({ mobile });
        if (!user) {
            return {
                success: false,
                message: 'User not found',
            };
        }

        user.upiId = upiId;
        if (isCustomUpdate) {
            user.isCustomUpi = true;
        }

        const updatedUser = await this.userRepository.save(user);
        return {
            success: true,
            message: 'UPI updated successfully',
            data: plainToInstance(UserResponseDto, updatedUser),
        };
    }

    async remove(id: number): Promise<boolean> {
        const result = await this.userRepository.softDelete(id);
        return result.affected > 0;
    }
}

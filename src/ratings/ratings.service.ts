import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from './entities/rating.entity';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { RatingResponseDto } from './dto/rating-response.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class RatingsService {
    constructor(
        @InjectRepository(Rating)
        private readonly ratingRepository: Repository<Rating>,
    ) {}

    async create(createRatingDto: CreateRatingDto) {
        const rating = this.ratingRepository.create(createRatingDto);
        const savedRating = await this.ratingRepository.save(rating);
        return plainToInstance(RatingResponseDto, savedRating);
    }

    async findAll(filters: { active?: boolean } = {}) {
        const queryBuilder = this.ratingRepository.createQueryBuilder('rating');

        if (filters.active !== undefined) {
            queryBuilder.andWhere('rating.active = :active', {
                active: filters.active,
            });
        }

        const ratings = await queryBuilder.getMany();
        return plainToInstance(RatingResponseDto, ratings);
    }

    async findOne(id: number) {
        const rating = await this.ratingRepository.findOneBy({ id });
        return rating ? plainToInstance(RatingResponseDto, rating) : null;
    }

    async findByUserId(userId: number) {
        const rating = await this.ratingRepository.findOneBy({
            user: { id: userId },
        });
        return rating ? plainToInstance(RatingResponseDto, rating) : null;
    }

    async update(id: number, updateRatingDto: UpdateRatingDto) {
        const rating = await this.ratingRepository.findOneBy({ id });
        if (!rating) {
            return null;
        }

        await this.ratingRepository.update(id, updateRatingDto);
        const updatedRating = await this.ratingRepository.findOneBy({ id });
        return plainToInstance(RatingResponseDto, updatedRating);
    }

    async remove(id: number): Promise<boolean> {
        const result = await this.ratingRepository.softDelete(id);
        return result.affected > 0;
    }
}

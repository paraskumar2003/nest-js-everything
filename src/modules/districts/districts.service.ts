import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { District } from './entities/district.entity';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';
import { plainToInstance } from 'class-transformer';
import { DistrictResponseDto } from './dto/district-response.dto';

@Injectable()
export class DistrictsService {
    constructor(
        @InjectRepository(District)
        private readonly districtRepository: Repository<District>,
    ) {}

    async create(
        createDistrictDto: CreateDistrictDto,
    ): Promise<DistrictResponseDto> {
        const district = this.districtRepository.create(createDistrictDto);
        const savedDistrict = await this.districtRepository.save(district);
        return plainToInstance(DistrictResponseDto, savedDistrict);
    }

    async findAll(): Promise<DistrictResponseDto[]> {
        const districts = await this.districtRepository.find({
            order: { name: 'ASC' },
            select: ['id', 'name'],
        });
        return plainToInstance(DistrictResponseDto, districts);
    }

    async findOne(id: number): Promise<DistrictResponseDto | null> {
        const district = await this.districtRepository.findOneBy({ id });
        return district ? plainToInstance(DistrictResponseDto, district) : null;
    }

    async findByName(name: string): Promise<DistrictResponseDto | null> {
        const district = await this.districtRepository.findOneBy({ name });
        return district ? plainToInstance(DistrictResponseDto, district) : null;
    }

    async update(
        id: number,
        updateDistrictDto: UpdateDistrictDto,
    ): Promise<DistrictResponseDto | null> {
        const district = await this.districtRepository.findOneBy({ id });
        if (!district) {
            return null;
        }

        await this.districtRepository.update(id, updateDistrictDto);
        const updatedDistrict = await this.districtRepository.findOneBy({ id });
        return plainToInstance(DistrictResponseDto, updatedDistrict);
    }

    async remove(id: number): Promise<boolean> {
        // Note: We'll check for users in the controller or through a service dependency
        const result = await this.districtRepository.softDelete(id);
        return result.affected > 0;
    }

    // Method to check if district exists (used by other modules)
    async exists(id: number): Promise<boolean> {
        const count = await this.districtRepository.count({ where: { id } });
        return count > 0;
    }
}

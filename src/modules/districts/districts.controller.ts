import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpStatus,
    HttpCode,
    NotFoundException,
    UseGuards,
    ParseIntPipe,
    BadRequestException,
} from '@nestjs/common';
import { DistrictsService } from './districts.service';
import { CreateDistrictDto } from './dto/create-district.dto';
import { UpdateDistrictDto } from './dto/update-district.dto';
import { CustomLoggerService } from 'src/logger/logger.service';
import { IdempotencyGuard } from 'src/idempotency/key-guard/idempotency.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { v4 as uuidv4 } from 'uuid';

@Controller('districts')
export class DistrictsController {
    constructor(
        private readonly districtsService: DistrictsService,
        private readonly logger: CustomLoggerService,
    ) {}

    @Post()
    @UseGuards(IdempotencyGuard)
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createDistrictDto: CreateDistrictDto) {
        const journeyId = uuidv4();
        this.logger.info('CREATE_DISTRICT_REQUEST', journeyId, {
            dto: createDistrictDto,
        });

        const result = await this.districtsService.create(createDistrictDto);

        this.logger.info('CREATE_DISTRICT_RESPONSE', journeyId, { result });
        return result;
    }

    @Get()
    async findAll() {
        const journeyId = uuidv4();
        this.logger.info('GET_DISTRICTS_REQUEST', journeyId, {});

        const result = await this.districtsService.findAll();

        this.logger.info('GET_DISTRICTS_RESPONSE', journeyId, {
            count: result.length,
        });
        return {
            success: true,
            message: 'Disticts Fetched Successfully',
            data: { result },
        };
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const journeyId = uuidv4();
        this.logger.info('GET_DISTRICT_REQUEST', journeyId, { id });

        const district = await this.districtsService.findOne(id);
        if (!district) {
            this.logger.error('GET_DISTRICT_NOT_FOUND', journeyId, { id });
            throw new NotFoundException(`District with ID ${id} not found`);
        }

        this.logger.info('GET_DISTRICT_RESPONSE', journeyId, { district });
        return district;
    }

    @Patch(':id')
    @UseGuards(IdempotencyGuard)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDistrictDto: UpdateDistrictDto,
    ) {
        const journeyId = uuidv4();
        this.logger.info('UPDATE_DISTRICT_REQUEST', journeyId, {
            id,
            dto: updateDistrictDto,
        });

        const updatedDistrict = await this.districtsService.update(
            id,
            updateDistrictDto,
        );
        if (!updatedDistrict) {
            this.logger.error('UPDATE_DISTRICT_NOT_FOUND', journeyId, { id });
            throw new NotFoundException(`District with ID ${id} not found`);
        }

        this.logger.info('UPDATE_DISTRICT_RESPONSE', journeyId, {
            district: updatedDistrict,
        });
        return updatedDistrict;
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        const journeyId = uuidv4();
        this.logger.info('DELETE_DISTRICT_REQUEST', journeyId, { id });

        try {
            // Note: In a real application, you might want to check for related users
            // This could be done by injecting UsersService or through a database constraint
            const result = await this.districtsService.remove(id);
            if (!result) {
                this.logger.error('DELETE_DISTRICT_NOT_FOUND', journeyId, {
                    id,
                });
                throw new NotFoundException(`District with ID ${id} not found`);
            }

            this.logger.info('DELETE_DISTRICT_SUCCESS', journeyId, { id });
        } catch (error) {
            this.logger.error('DELETE_DISTRICT_ERROR', journeyId, {
                id,
                error: error.message,
            });
            throw error;
        }
    }
}

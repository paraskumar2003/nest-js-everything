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
  Query,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IdempotencyGuard } from '../idempotency/idempotency.guard';
import { CustomLoggerService } from '../logger/logger.service';
import { v4 as uuidv4 } from 'uuid';

@Controller('ratings')
@UseGuards(JwtAuthGuard)
export class RatingsController {
  constructor(
    private readonly ratingsService: RatingsService,
    private readonly logger: CustomLoggerService,
  ) {}

  @Post()
  @UseGuards(IdempotencyGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRatingDto: CreateRatingDto) {
    const journeyId = uuidv4();
    this.logger.info('CREATE_RATING_REQUEST', journeyId, { dto: createRatingDto });
    
    const result = await this.ratingsService.create(createRatingDto);
    
    this.logger.info('CREATE_RATING_RESPONSE', journeyId, { result });
    return result;
  }

  @Get()
  async findAll(@Query('active') active?: string) {
    const journeyId = uuidv4();
    this.logger.info('GET_RATINGS_REQUEST', journeyId, { active });
    
    const result = await this.ratingsService.findAll({
      active: active === 'true' ? true : active === 'false' ? false : undefined,
    });
    
    this.logger.info('GET_RATINGS_RESPONSE', journeyId, { count: result.length });
    return result;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const journeyId = uuidv4();
    this.logger.info('GET_RATING_REQUEST', journeyId, { id });
    
    const rating = await this.ratingsService.findOne(+id);
    if (!rating) {
      this.logger.error('GET_RATING_NOT_FOUND', journeyId, { id });
      throw new NotFoundException(`Rating with ID ${id} not found`);
    }
    
    this.logger.info('GET_RATING_RESPONSE', journeyId, { rating });
    return rating;
  }

  @Patch(':id')
  @UseGuards(IdempotencyGuard)
  async update(@Param('id') id: string, @Body() updateRatingDto: UpdateRatingDto) {
    const journeyId = uuidv4();
    this.logger.info('UPDATE_RATING_REQUEST', journeyId, { id, dto: updateRatingDto });
    
    const updatedRating = await this.ratingsService.update(+id, updateRatingDto);
    if (!updatedRating) {
      this.logger.error('UPDATE_RATING_NOT_FOUND', journeyId, { id });
      throw new NotFoundException(`Rating with ID ${id} not found`);
    }
    
    this.logger.info('UPDATE_RATING_RESPONSE', journeyId, { rating: updatedRating });
    return updatedRating;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    const journeyId = uuidv4();
    this.logger.info('DELETE_RATING_REQUEST', journeyId, { id });
    
    const result = await this.ratingsService.remove(+id);
    if (!result) {
      this.logger.error('DELETE_RATING_NOT_FOUND', journeyId, { id });
      throw new NotFoundException(`Rating with ID ${id} not found`);
    }
    
    this.logger.info('DELETE_RATING_SUCCESS', journeyId, { id });
  }
}
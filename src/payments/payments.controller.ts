import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CustomLoggerService } from '../logger/logger.service';
import { v4 as uuidv4 } from 'uuid';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly logger: CustomLoggerService,
  ) {}

  @Post()
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    const journeyId = uuidv4();
    this.logger.info('CREATE_PAYMENT_REQUEST', journeyId, { dto: createPaymentDto });
    
    const result = await this.paymentsService.create(createPaymentDto);
    
    this.logger.info('CREATE_PAYMENT_RESPONSE', journeyId, { result });
    return result;
  }

  @Get()
  async findAll() {
    const journeyId = uuidv4();
    this.logger.info("GET_PAYMENTS_REQUEST", journeyId, {});
    
    const result = await this.paymentsService.findAll();
    
    this.logger.info('GET_PAYMENTS_RESPONSE', journeyId, { count: result.length });
    return result;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const journeyId = uuidv4();
    this.logger.info('GET_PAYMENT_REQUEST', journeyId, { id });
    
    const result = await this.paymentsService.findOne(+id);
    
    this.logger.info('GET_PAYMENT_RESPONSE', journeyId, { result });
    return result;
  }
}
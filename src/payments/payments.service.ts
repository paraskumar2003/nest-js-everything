import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Payment } from './entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import {
    UpiResponse,
    PaymentProcessResponse,
} from './interfaces/upi.interface';
import { plainToInstance } from 'class-transformer';
import { User } from '../users/entities/user.entity';
import { Coupon } from '../coupons/entities/coupon.entity';
import { CustomLoggerService } from '../logger/logger.service';
import { HmacService } from '../utils/hmac.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PaymentsService {
    private readonly rewardsApiUrl: string;
    private readonly rewardsPmToken: string;
    private readonly rewardsSecretKey: string;
    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Coupon)
        private readonly couponRepository: Repository<Coupon>,
        private readonly configService: ConfigService,
        private readonly logger: CustomLoggerService,
        private readonly hmacService: HmacService,
    ) {
        this.rewardsApiUrl =
            this.configService.get('NODE_ENV') == 'development'
                ? this.configService.get('REWARDS_API_URL_DEV')
                : this.configService.get('REWARDS_API_URL_PROD');
        this.rewardsPmToken =
            this.configService.get('NODE_ENV') == 'development'
                ? this.configService.get('REWARDS_PM_TOKEN_DEV')
                : this.configService.get('REWARDS_PM_TOKEN_PROD');
        this.rewardsSecretKey = this.configService.get('NODE_ENV')
            ? this.configService.get('REWARDS_SECRET_KEY')
            : this.configService.get('REWARDS_SECRET_KEY');
    }

    public async fetchUpiId(mobile: string): Promise<UpiResponse> {
        const journeyId = uuidv4();
        const transactionId = uuidv4();
        const payload = {
            type: 'kyc_mobileToUpi',
            id_number: mobile,
            transaction_id: transactionId,
        };

        try {
            const hmac = this.hmacService.createHmac(
                JSON.stringify(payload),
                this.rewardsSecretKey,
            );

            this.logger.info('FETCH_UPI_REQUEST', journeyId, { payload });

            const response = await axios.post(
                `${this.rewardsApiUrl}/gratification/kyc`,
                payload,
                {
                    headers: {
                        permanent_token: this.rewardsPmToken,
                        'x-hmac': hmac,
                    },
                },
            );

            this.logger.info('FETCH_UPI_RESPONSE', journeyId, {
                success: true,
                mobile,
                transactionId,
                response: response.data,
            });

            return {
                success: true,
                upiId: response.data?.data?.upi_id,
            };
        } catch (error) {
            this.logger.error('FETCH_UPI_ERROR', journeyId, {
                mobile,
                transactionId,
                error: error.message,
                response: error.response?.data,
                payload,
            });

            return {
                success: false,
                upiId: null,
                message: 'Failed to fetch UPI ID',
            };
        }
    }

    private async processPayment(
        upiId: string,
        amount: number,
        mobile: string,
        reference: string,
    ): Promise<PaymentProcessResponse> {
        const journeyId = uuidv4();
        try {
            const payload = {
                type: 'upi',
                name: mobile,
                email: '',
                msisdn: mobile,
                upi_id: upiId,
                sku: 'APC003T0307U',
                amount:
                    this.configService.get('NODE_ENV') == 'development'
                        ? 1
                        : 40,
                transaction_id: reference,
            };

            const hmac = this.hmacService.createHmac(
                JSON.stringify(payload),
                this.rewardsSecretKey,
            );

            this.logger.info('PROCESS_PAYMENT_REQUEST', journeyId, {
                upiId,
                amount,
                reference,
            });

            const response = await axios.post(
                `${this.rewardsApiUrl}/gratification`,
                payload,
                {
                    headers: {
                        permanent_token: this.rewardsPmToken,
                        'x-hmac': hmac,
                    },
                },
            );

            this.logger.info('PROCESS_PAYMENT_RESPONSE', journeyId, {
                success: true,
                reference,
                response: response.data,
            });

            return {
                success: true,
                transactionId: response.data.transactionId,
                message: 'Payment processed successfully',
                status: 'SUCCESS',
            };
        } catch (error) {
            this.logger.error('PROCESS_PAYMENT_ERROR', journeyId, {
                upiId,
                amount,
                reference,
                error: error.message,
                response: error.response?.data,
            });

            return {
                success: false,
                message: 'Payment processing failed',
                status: 'FAILED',
            };
        }
    }

    async create(
        createPaymentDto: CreatePaymentDto,
        queryRunner?: QueryRunner,
    ): Promise<PaymentResponseDto> {
        const journeyId = uuidv4();
        const repository = queryRunner
            ? queryRunner.manager.getRepository(Payment)
            : this.paymentRepository;
        const userRepository = queryRunner
            ? queryRunner.manager.getRepository(User)
            : this.userRepository;
        const couponRepository = queryRunner
            ? queryRunner.manager.getRepository(Coupon)
            : this.couponRepository;

        try {
            const user = await userRepository.findOneBy({
                id: createPaymentDto.paidTo,
            });
            if (!user) {
                throw new NotFoundException(
                    `User with ID ${createPaymentDto.paidTo} not found`,
                );
            }

            const coupon = await couponRepository.findOneBy({
                id: createPaymentDto.paidFor,
            });
            if (!coupon) {
                throw new NotFoundException(
                    `Coupon with ID ${createPaymentDto.paidFor} not found`,
                );
            }

            if (!user.upiId) {
                throw new BadRequestException(
                    'Please add or confirm UPI id first',
                );
            }

            // Process payment
            const paymentResponse = await this.processPayment(
                user.upiId,
                createPaymentDto.paidAmount,
                user.mobile,
                `ALMDKYC0001MUPIKYCTEST30GPI${coupon.id}${Date.now()}`,
            );

            const payment = repository.create({
                paidTo: user,
                paidFor: coupon,
                paidAmount: createPaymentDto.paidAmount,
                upiId: user.upiId,
                paymentStatus: paymentResponse.status,
            });

            const savedPayment = await repository.save(payment);

            this.logger.info('PAYMENT_CREATED', journeyId, {
                paymentId: savedPayment.id,
                userId: user.id,
                couponId: coupon.id,
                amount: createPaymentDto.paidAmount,
                upiId: user.upiId,
                status: paymentResponse.status,
                transactionId: paymentResponse.transactionId,
            });

            return plainToInstance(PaymentResponseDto, savedPayment);
        } catch (error) {
            this.logger.error('PAYMENT_CREATION_ERROR', journeyId, {
                error: error.message,
                dto: createPaymentDto,
            });
            throw error;
        }
    }

    async findAll(): Promise<PaymentResponseDto[]> {
        const payments = await this.paymentRepository.find({
            relations: ['paidTo', 'paidFor'],
        });
        return plainToInstance(PaymentResponseDto, payments);
    }

    async findOne(id: number): Promise<PaymentResponseDto> {
        const payment = await this.paymentRepository.findOne({
            where: { id },
            relations: ['paidTo', 'paidFor'],
        });

        if (!payment) {
            throw new NotFoundException(`Payment with ID ${id} not found`);
        }

        return plainToInstance(PaymentResponseDto, payment);
    }
}

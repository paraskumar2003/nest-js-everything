import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    HttpStatus,
    HttpCode,
    Query,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { OtpsService } from './otps.service';
import { CreateOtpDto } from './dto/create-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { CustomLoggerService } from '../../logger/logger.service';
import { v4 as uuidv4 } from 'uuid';

@Controller('otps')
export class OtpsController {
    constructor(
        private readonly otpsService: OtpsService,
        private readonly logger: CustomLoggerService,
    ) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createOtpDto: CreateOtpDto) {
        const journeyId = uuidv4();
        this.logger.info('CREATE_OTP_REQUEST', journeyId, {
            dto: createOtpDto,
        });

        const result = await this.otpsService.create(createOtpDto);

        this.logger.info('CREATE_OTP_RESPONSE', journeyId, { result });
        return result;
    }

    @Post('verify')
    async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
        const journeyId = uuidv4();
        this.logger.info('VERIFY_OTP_REQUEST', journeyId, {
            mobile: verifyOtpDto.mobile,
            otp: verifyOtpDto.otp,
        });

        const result = await this.otpsService.verifyOtp(verifyOtpDto);
        if (!result.success) {
            this.logger.error('VERIFY_OTP_FAILED', journeyId, {
                mobile: verifyOtpDto.mobile,
                reason: result.message,
            });
            throw new BadRequestException(result.message);
        }

        this.logger.info('VERIFY_OTP_SUCCESS', journeyId, { result });
        return result;
    }

    @Get()
    async findAll(
        @Query('mobile') mobile?: string,
        @Query('verified') verified?: string,
    ) {
        const journeyId = uuidv4();
        this.logger.info('GET_OTPS_REQUEST', journeyId, { mobile, verified });

        const result = await this.otpsService.findAll({
            mobile,
            verified:
                verified === 'true'
                    ? true
                    : verified === 'false'
                      ? false
                      : undefined,
        });

        this.logger.info('GET_OTPS_RESPONSE', journeyId, {
            count: result.length,
        });
        return result;
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const journeyId = uuidv4();
        this.logger.info('GET_OTP_REQUEST', journeyId, { id });

        const otp = await this.otpsService.findOne(+id);
        if (!otp) {
            this.logger.error('GET_OTP_NOT_FOUND', journeyId, { id });
            throw new NotFoundException(`OTP with ID ${id} not found`);
        }

        this.logger.info('GET_OTP_RESPONSE', journeyId, { otp });
        return otp;
    }
}

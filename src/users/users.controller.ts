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
    BadRequestException,
    UseGuards,
} from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/modules/users/dto/update-user.dto';
import { UpdateUpiDto } from 'src/modules/users/dto/update-upi.dto';
import { CustomLoggerService } from '../logger/logger.service';
import { PaymentsService } from 'src/modules/payments/payments.service';
import { IdempotencyGuard } from '../idempotency/key-guard/idempotency.guard';
import { v4 as uuidv4 } from 'uuid';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly paymentsService: PaymentsService,
        private readonly logger: CustomLoggerService,
    ) {}

    @Post('upi/:mobile')
    @UseGuards(IdempotencyGuard)
    async updateUpi(
        @Param('mobile') mobile: string,
        @Body() updateUpiDto: UpdateUpiDto,
    ) {
        const journeyId = uuidv4();
        this.logger.info('UPDATE_UPI_REQUEST', journeyId, {
            mobile,
            upiId: updateUpiDto.upi_id,
        });

        try {
            const user = await this.usersService.findByMobile(mobile);

            if (!user) {
                this.logger.warn('UPDATE_UPI_USER_NOT_FOUND', journeyId, {
                    mobile,
                });
                return {
                    success: false,
                    message: 'User does not exist!',
                    data: null,
                };
            }

            if (user.isCustomUpi) {
                this.logger.warn('UPDATE_UPI_ALREADY_UPDATED', journeyId, {
                    mobile,
                });
                return {
                    success: false,
                    message: 'You have already updated your upi id once.',
                    data: null,
                };
            }

            const result = await this.usersService.updateUpiId(
                mobile,
                updateUpiDto.upi_id,
                true,
            );

            if (!result.success) {
                this.logger.warn('UPDATE_UPI_FAILED', journeyId, {
                    mobile,
                    reason: result.message,
                });
                return {
                    success: false,
                    message: result.message,
                    data: null,
                };
            }

            this.logger.info('UPDATE_UPI_SUCCESS', journeyId, {
                mobile,
                upiId: updateUpiDto.upi_id,
            });

            return {
                success: true,
                message: 'Upi updated successfully !!',
                data: null,
            };
        } catch (error) {
            this.logger.error('UPDATE_UPI_ERROR', journeyId, {
                mobile,
                error: error.message,
            });
            throw error;
        }
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createUserDto: CreateUserDto) {
        const journeyId = uuidv4();
        this.logger.info('CREATE_USER_REQUEST', journeyId, {
            dto: createUserDto,
        });

        const result = await this.usersService.create(createUserDto);

        this.logger.info('CREATE_USER_RESPONSE', journeyId, { result });
        return result;
    }

    @Get()
    async findAll(@Query('active') active?: string) {
        const journeyId = uuidv4();
        this.logger.info('GET_USERS_REQUEST', journeyId, { active });

        const result = await this.usersService.findAll({
            active:
                active === 'true'
                    ? true
                    : active === 'false'
                      ? false
                      : undefined,
        });

        this.logger.info('GET_USERS_RESPONSE', journeyId, {
            count: result.length,
        });
        return result;
    }

    @Get('upi/:mobile')
    async getUpiId(@Param('mobile') mobile: string) {
        const journeyId = uuidv4();
        this.logger.info('GET_UPI_REQUEST', journeyId, { mobile });

        try {
            // First check if user exists and has UPI ID
            const user = await this.usersService.findByMobile(mobile);
            if (user?.upiId) {
                this.logger.info('GET_UPI_FROM_DB', journeyId, {
                    mobile,
                    upiId: user.upiId,
                });
                return {
                    success: true,
                    message: 'UPI id fetched successfully',
                    data: {
                        upi_id: user.upiId,
                        isAlreadyUpdated: user?.isCustomUpi || false,
                    },
                };
            }

            // If no UPI ID in DB, fetch from service
            const upiResponse = await this.paymentsService.fetchUpiId(mobile);

            if (!upiResponse.success) {
                this.logger.error('GET_UPI_FAILED', journeyId, {
                    mobile,
                    error: upiResponse.message,
                });
                throw new BadRequestException(upiResponse.message);
            }

            // Update user's UPI ID in database
            if (user) {
                await this.usersService.updateUpiId(mobile, upiResponse.upiId);
                this.logger.info('UPI_ID_UPDATED', journeyId, {
                    mobile,
                    upiId: upiResponse.upiId,
                });
            }

            this.logger.info('GET_UPI_RESPONSE', journeyId, {
                mobile,
                upiId: upiResponse.upiId,
            });

            return {
                success: true,
                message: 'UPI id fetched successfully',
                data: {
                    upi_id: upiResponse.upiId,
                },
            };
        } catch (error) {
            this.logger.error('GET_UPI_ERROR', journeyId, {
                mobile,
                error: error.message,
            });
            throw error;
        }
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const journeyId = uuidv4();
        this.logger.info('GET_USER_REQUEST', journeyId, { id });

        const user = await this.usersService.findOne(+id);
        if (!user) {
            this.logger.error('GET_USER_NOT_FOUND', journeyId, { id });
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        this.logger.info('GET_USER_RESPONSE', journeyId, { user });
        return user;
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        const journeyId = uuidv4();
        this.logger.info('UPDATE_USER_REQUEST', journeyId, {
            id,
            dto: updateUserDto,
        });

        const updatedUser = await this.usersService.update(+id, updateUserDto);
        if (!updatedUser) {
            this.logger.error('UPDATE_USER_NOT_FOUND', journeyId, { id });
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        this.logger.info('UPDATE_USER_RESPONSE', journeyId, {
            user: updatedUser,
        });
        return updatedUser;
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        const journeyId = uuidv4();
        this.logger.info('DELETE_USER_REQUEST', journeyId, { id });

        const result = await this.usersService.remove(+id);
        if (!result) {
            this.logger.error('DELETE_USER_NOT_FOUND', journeyId, { id });
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        this.logger.info('DELETE_USER_SUCCESS', journeyId, { id });
    }
}

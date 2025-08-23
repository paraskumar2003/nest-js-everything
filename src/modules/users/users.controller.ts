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
    ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CustomLoggerService } from 'src/logger/logger.service';
import { IdempotencyGuard } from 'src/idempotency/key-guard/idempotency.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserRole } from './entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly logger: CustomLoggerService,
    ) {}

    @Post()
    @UseGuards(IdempotencyGuard)
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
    async findAll(
        @Query('active') active?: string,
        @Query('role') role?: UserRole,
        @Query('districtId') districtId?: string,
    ) {
        const journeyId = uuidv4();
        this.logger.info('GET_USERS_REQUEST', journeyId, {
            active,
            role,
            districtId,
        });

        const result = await this.usersService.findAll({
            where: {
                role,
            },
        });

        this.logger.info('GET_USERS_RESPONSE', journeyId, {
            count: result.length,
        });
        return result;
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const journeyId = uuidv4();
        this.logger.info('GET_USER_REQUEST', journeyId, { id });

        const user = await this.usersService.findOneById(id);
        if (!user) {
            this.logger.error('GET_USER_NOT_FOUND', journeyId, { id });
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        this.logger.info('GET_USER_RESPONSE', journeyId, { user });
        return user;
    }

    @Patch(':id')
    @UseGuards(IdempotencyGuard)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        const journeyId = uuidv4();
        this.logger.info('UPDATE_USER_REQUEST', journeyId, {
            id,
            dto: updateUserDto,
        });

        const updatedUser = await this.usersService.update(id, updateUserDto);
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
    async remove(@Param('id', ParseIntPipe) id: number) {
        const journeyId = uuidv4();
        this.logger.info('DELETE_USER_REQUEST', journeyId, { id });

        const result = await this.usersService.remove(id);
        if (!result) {
            this.logger.error('DELETE_USER_NOT_FOUND', journeyId, { id });
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        this.logger.info('DELETE_USER_SUCCESS', journeyId, { id });
    }
}

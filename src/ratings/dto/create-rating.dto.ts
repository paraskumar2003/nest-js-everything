import {
    IsNotEmpty,
    IsNumber,
    IsString,
    Length,
    Max,
    Min,
} from 'class-validator';
import { User } from 'src/users/entities/user.entity';

export class CreateRatingDto {
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    @Max(5)
    scale: number;

    user: User;
}

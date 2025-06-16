import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';
import { User } from 'src/modules/users/entities/user.entity';

export class CreateRatingDto {
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    @Max(5)
    scale: number;

    user: User;
}

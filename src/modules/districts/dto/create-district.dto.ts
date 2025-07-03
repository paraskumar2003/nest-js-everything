import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateDistrictDto {
    @IsString()
    @IsNotEmpty()
    @Length(1, 255)
    name: string;
}

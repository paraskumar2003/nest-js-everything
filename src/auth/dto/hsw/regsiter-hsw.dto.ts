import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class RegisterHSWDto {
    @IsString({ message: 'Mobile number must be a string.' })
    @IsNotEmpty({ message: 'Mobile number is required.' })
    mobile: string;

    @IsString({ message: 'Name must be a string.' })
    @IsNotEmpty({ message: 'Name is required.' })
    name: string;

    @IsString({ message: 'Email must be a string.' })
    @IsEmail({}, { message: 'Please enter a valid email address.' })
    @IsNotEmpty({ message: 'Email is required.' })
    email: string;

    @IsString({ message: 'District must be a string.' })
    @IsNotEmpty({ message: 'District is required.' })
    district: string;
}

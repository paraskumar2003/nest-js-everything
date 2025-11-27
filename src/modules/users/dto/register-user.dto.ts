import { IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';
 
export class RegisterUserDto {
    @IsNotEmpty({ message: 'Name is required' })
    @IsString()
    name: string;
 
    @IsNotEmpty({ message: 'Mobile number is required' })
    @Matches(/^[0-9]{10}$/, { message: 'Mobile number must be 10 digits' })
    mobile: string;
 
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;
}
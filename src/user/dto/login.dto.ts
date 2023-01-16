import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, {
    message: 'Password cannot be less than 6 characters',
  })
  password: string;
}

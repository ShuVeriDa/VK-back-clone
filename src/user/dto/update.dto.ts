import { IsEmail, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  email?: string;

  @IsString()
  @MinLength(6, {
    message: 'Password cannot be less than 6 characters',
  })
  password?: string;

  @IsString()
  @MinLength(3, {
    message: 'First name cannot be less than 3 characters',
  })
  firstName?: string;

  @IsString()
  @MinLength(3, {
    message: 'Last name cannot be less than 3 characters',
  })
  lastName?: string;

  @IsString()
  status?: string;
}

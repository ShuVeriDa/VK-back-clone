import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, {
    message: 'Password cannot be less than 6 characters',
  })
  password?: string;

  @IsOptional()
  @IsString()
  @MinLength(3, {
    message: 'First name cannot be less than 3 characters',
  })
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(3, {
    message: 'Last name cannot be less than 3 characters',
  })
  lastName?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  location?: string;
}

import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class LoginAuthDto {
  @IsEmail({}, { message: 'Invalid email format.' })
  email: string;

  @IsString({ message: 'Password must be a string.' })
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  @MaxLength(64, { message: 'Password cannot exceed 64 characters.' })
  password: string;
}

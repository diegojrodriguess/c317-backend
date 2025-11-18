import { 
  IsEmail, 
  IsString, 
  MinLength, 
  MaxLength, 
  IsInt, 
  Min, 
  Max, 
  Matches 
} from 'class-validator';

export class RegisterAuthDto {
  @IsEmail({}, { message: 'Invalid email format.' })
  email: string;

  @IsString({ message: 'Password must be a string.' })
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  @MaxLength(64, { message: 'Password cannot exceed 64 characters.' })
  password: string;

  @IsString({ message: 'Name must be a string.' })
  @MinLength(2, { message: 'Name must be at least 2 characters long.' })
  @MaxLength(50, { message: 'Name cannot exceed 50 characters.' })
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'Name can only contain letters and spaces.',
  })
  name: string;

  @IsInt({ message: 'Age must be an integer.' })
  @Min(1, { message: 'Age must be greater than 0.' })
  @Max(120, { message: 'Age must be less than or equal to 120.' })
  age: number;
}

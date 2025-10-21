import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  MinLength,
  IsInt,
  Min,
  Max,
  IsIn,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'Name must be a string.' })
  name: string;

  @IsEmail({}, { message: 'The provided email is invalid.' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long.' })
  password: string;

  @IsOptional()
  @IsInt({ message: 'Age must be an integer.' })
  @Min(0, { message: 'Age cannot be negative.' })
  @Max(120, { message: 'Age cannot be greater than 120.' })
  age?: number;

  @IsOptional()
  @IsIn(['leve', 'moderado', 'grave'], {
    message: 'Speech difficulty type must be leve, moderado, or grave.',
  })
  speechDifficultyType?: string;

  @IsOptional()
  @IsArray({ message: 'Roles must be an array.' })
  @ArrayNotEmpty({ message: 'Roles array cannot be empty.' })
  roles?: string[];
}

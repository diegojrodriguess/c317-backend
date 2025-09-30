import { IsString, IsEmail, IsOptional, IsArray, MinLength, IsInt } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsInt()
  age?: number;

  @IsOptional()
  @IsString()
  speechDifficultyType?: string;

  @IsOptional()
  @IsArray()
  roles?: string[];
}

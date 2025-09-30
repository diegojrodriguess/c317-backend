import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterAuthDto } from './dto/register-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterAuthDto) {
    const userDto = new CreateUserDto();
    userDto.email = dto.email;
    userDto.password = dto.password;
    userDto.name = dto.name;
    
    if (dto.age !== undefined) {
      userDto.age = Number(dto.age);
    }
    const user = await this.usersService.create(userDto);
    return this.generateToken(user._id.toString(), user.email);
  }

  async login(dto: LoginAuthDto) {
    const user = await this.usersService.findByEmail(dto.email);

    if (!user || !(await this.usersService.validatePassword(user.email, dto.password))) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return this.generateToken(user._id.toString(), user.email);
  }

  private generateToken(userId: string, email: string) {
    const payload = { sub: userId, email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

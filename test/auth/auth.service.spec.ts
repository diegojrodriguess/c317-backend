import { describe, it, expect, beforeAll, jest } from '@jest/globals';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { RegisterAuthDto } from '../../src/auth/dto/register-auth.dto';
import { LoginAuthDto } from '../../src/auth/dto/login-auth.dto';
import { CreateUserDto } from '../../src/users/dto/create-user.dto';
import { EmailAlreadyRegisteredException } from '../../src/users/exceptions/email-already-registered.exception';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    _id: '12345',
    email: 'jane.doe@example.com',
    name: 'Jane Doe',
    passwordHash: 'hashed_password',
  };

  const registerDto: RegisterAuthDto = {
    email: 'jane.doe@example.com',
    password: '123456',
    name: 'Jane Doe',
    age: 30,
  };

  const loginDto: LoginAuthDto = {
    email: 'jane.doe@example.com',
    password: '123456',
  };

  beforeAll(() => {
    usersService = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      validatePassword: jest.fn(),
    } as any;

    jwtService = {
      sign: jest.fn(),
    } as any;

    authService = new AuthService(usersService, jwtService);
  });

  // ------------------------------
  // REGISTER TESTS
  // ------------------------------
  it('should register a new user and return a token', async () => {
    usersService.create.mockResolvedValue(mockUser as any);
    jwtService.sign.mockReturnValue('mocked_jwt_token');

    const result = await authService.register(registerDto);

    expect(usersService.create).toHaveBeenCalledWith(expect.any(CreateUserDto));
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: mockUser._id.toString(),
      email: mockUser.email,
    });
    expect(result).toEqual({ access_token: 'mocked_jwt_token' });
  });

  it('should throw an error if user creation fails (email already exists)', async () => {
    usersService.create.mockRejectedValue(
      new EmailAlreadyRegisteredException(registerDto.email),
    );

    await expect(authService.register(registerDto)).rejects.toThrow(
      EmailAlreadyRegisteredException,
    );
  });

  it('should handle unexpected errors during register', async () => {
    usersService.create.mockRejectedValue(new Error('Unexpected DB Error'));

    await expect(authService.register(registerDto)).rejects.toThrow(
      'Unexpected DB Error',
    );
  });

  // ------------------------------
  // LOGIN TESTS
  // ------------------------------
  it('should successfully login and return a token', async () => {
    usersService.findByEmail.mockResolvedValue(mockUser as any);
    usersService.validatePassword.mockResolvedValue(true);
    jwtService.sign.mockReturnValue('mocked_jwt_token');

    const result = await authService.login(loginDto);

    expect(usersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
    expect(usersService.validatePassword).toHaveBeenCalledWith(
      loginDto.email,
      loginDto.password,
    );
    expect(result).toEqual({ access_token: 'mocked_jwt_token' });
  });

  it('should throw UnauthorizedException when user not found', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(authService.login(loginDto)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException when password is invalid', async () => {
    usersService.findByEmail.mockResolvedValue(mockUser as any);
    usersService.validatePassword.mockResolvedValue(false);

    await expect(authService.login(loginDto)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should propagate unexpected errors during login', async () => {
    usersService.findByEmail.mockRejectedValue(new Error('DB Connection Lost'));

    await expect(authService.login(loginDto)).rejects.toThrow(
      'DB Connection Lost',
    );
  });

  // ------------------------------
  // TOKEN GENERATION
  // ------------------------------
  it('should generate a valid JWT token with correct payload', () => {
    const signSpy = jest.spyOn(jwtService, 'sign').mockReturnValue('signed_token');

    const result = (authService as any).generateToken('12345', 'user@test.com');

    expect(signSpy).toHaveBeenCalledWith({
      sub: '12345',
      email: 'user@test.com',
    });
    expect(result).toEqual({ access_token: 'signed_token' });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from '../../src/auth/auth.service';
import { RegisterAuthDto } from '../../src/auth/dto/register-auth.dto';
import { LoginAuthDto } from '../../src/auth/dto/login-auth.dto';

jest.mock('../../src/auth/auth.service', () => {
  return {
    AuthService: jest.fn().mockImplementation(() => ({
      register: jest.fn(),
      login: jest.fn(),
    })),
  };
});

describe('AuthController', () => {
  let authController: AuthController;
  let authService: jest.Mocked<InstanceType<typeof AuthService>>;

  const mockTokenResponse = {
    access_token: 'mocked_token',
  };

  const mockUserResponse = {
    _id: 'abc123',
    name: 'John Doe',
    email: 'john@example.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get(AuthService) as AuthService as jest.Mocked<InstanceType<typeof AuthService>>;
  });

  describe('register', () => {
    it('should register a user and return the created user', async () => {
      const dto: RegisterAuthDto = {
        email: 'john@example.com',
        password: '123456',
        name: 'John Doe',
        age: 25,
      };

      authService.register.mockResolvedValue(mockUserResponse as any);

      const result = await authController.register(dto);

      expect(result).toEqual(mockUserResponse);
      expect(authService.register).toHaveBeenCalledWith(dto);
    });

    it('should throw an error when registration fails', async () => {
      const dto: RegisterAuthDto = {
        email: 'john@example.com',
        password: '123456',
        name: 'John Doe',
        age: 25,
      };

      authService.register.mockRejectedValue(new Error('Registration failed'));

      await expect(authController.register(dto)).rejects.toThrow('Registration failed');
    });
  });

  describe('login', () => {
    it('should login a user and return an access token', async () => {
      const dto: LoginAuthDto = {
        email: 'john@example.com',
        password: '123456',
      };

      authService.login.mockResolvedValue(mockTokenResponse);

      const result = await authController.login(dto);

      expect(result).toEqual(mockTokenResponse);
      expect(authService.login).toHaveBeenCalledWith(dto);
    });

    it('should throw an error when login fails', async () => {
      const dto: LoginAuthDto = {
        email: 'john@example.com',
        password: 'wrong_password',
      };

      authService.login.mockRejectedValue(new Error('Invalid credentials'));

      await expect(authController.login(dto)).rejects.toThrow('Invalid credentials');
    });
  });
});

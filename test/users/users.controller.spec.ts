import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../src/users/users.controller';
import { User } from '../../src/users/schemas/user.schema';
import { UsersService } from '../../src/users/users.service';
import { CreateUserDto } from '../../src/users/dto/create-user.dto';
import { UpdateUserDto } from '../../src/users/dto/update-user.dto';
import { EmailAlreadyRegisteredException } from '../../src/users/exceptions/email-already-registered.exception';
import { UserNotFoundException } from '../../src/users/exceptions/user-not-found.exception';
import { EmailNotFoundException } from '../../src/users/exceptions/email-not-found.exception';

jest.mock('../../src/users/users.service', () => {
  return {
    UsersService: jest.fn().mockImplementation(() => ({
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    })),
  };
});

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: jest.Mocked<InstanceType<typeof UsersService>>;

  const mockUser = {
    _id: '123',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    passwordHash: 'hashed_password',
    age: 30,
    speechDifficultyType: 'medium',
    roles: ['user'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService], 
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService) as UsersService as jest.Mocked<InstanceType<typeof UsersService>>;
  });

  describe('create', () => {
    it('should create a user', async () => {
      const dto: CreateUserDto = {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        password: '123456',
        age: 30,
      };

      usersService.create.mockResolvedValue(mockUser as User);

      const result = await usersController.create(dto);
      expect(result).toEqual(mockUser);
      expect(usersService.create).toHaveBeenCalledWith(dto);
    });

    it('should throw EmailAlreadyRegisteredException when email exists', async () => {
      const dto: CreateUserDto = {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        password: '123456',
        age: 30,
      };

      usersService.create.mockRejectedValue(
        new EmailAlreadyRegisteredException(dto.email),
      );

      await expect(usersController.create(dto)).rejects.toThrow(
        EmailAlreadyRegisteredException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      usersService.findAll.mockResolvedValue([mockUser as User]);

      const result = await usersController.findAll();
      expect(result).toEqual([mockUser]);
      expect(usersService.findAll).toHaveBeenCalled();
    });

    it('should handle service error', async () => {
      usersService.findAll.mockRejectedValue(new Error('DB Error'));

      await expect(usersController.findAll()).rejects.toThrow('DB Error');
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      usersService.findOne.mockResolvedValue(mockUser as User);

      const result = await usersController.findOne('123');
      expect(result).toEqual(mockUser);
      expect(usersService.findOne).toHaveBeenCalledWith('123');
    });

    it('should throw UserNotFoundException when user not found', async () => {
      usersService.findOne.mockRejectedValue(new UserNotFoundException('123'));

      await expect(usersController.findOne('123')).rejects.toThrow(
        UserNotFoundException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      usersService.findByEmail.mockResolvedValue(mockUser as User);

      const result = await usersController.findByEmail('jane.doe@example.com');
      expect(result).toEqual(mockUser);
      expect(usersService.findByEmail).toHaveBeenCalledWith(
        'jane.doe@example.com',
      );
    });

    it('should throw EmailNotFoundException when user not found', async () => {
      usersService.findByEmail.mockRejectedValue(
        new EmailNotFoundException('notfound@example.com'),
      );

      await expect(
        usersController.findByEmail('notfound@example.com'),
      ).rejects.toThrow(EmailNotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const dto: UpdateUserDto = { name: 'Jane Smith' };
      const updatedUser = { ...mockUser, ...dto };

      usersService.update.mockResolvedValue(updatedUser as any);

      const result = await usersController.update('123', dto);
      expect(result).toEqual(updatedUser);
      expect(usersService.update).toHaveBeenCalledWith('123', dto);
    });

    it('should throw UserNotFoundException when updating non-existent user', async () => {
      usersService.update.mockRejectedValue(new UserNotFoundException('123'));

      await expect(
        usersController.update('123', { name: 'Does Not Exist' }),
      ).rejects.toThrow(UserNotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      usersService.remove.mockResolvedValue(mockUser as User);

      const result = await usersController.remove('123');
      expect(result).toEqual(mockUser);
      expect(usersService.remove).toHaveBeenCalledWith('123');
    });

    it('should throw UserNotFoundException when removing non-existent user', async () => {
      usersService.remove.mockRejectedValue(new UserNotFoundException('123'));

      await expect(usersController.remove('123')).rejects.toThrow(
        UserNotFoundException,
      );
    });
  });
});

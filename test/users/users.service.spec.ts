import { describe, expect, beforeAll, jest, it } from '@jest/globals';
import { UsersService } from '../../src/users/users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../../src/users/schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../../src/users/dto/create-user.dto';
import { UpdateUserDto } from '../../src/users/dto/update-user.dto';
import { EmailAlreadyRegisteredException } from '../../src/users/exceptions/email-already-registered.exception';
import { EmailFieldChangeNotAllowedException } from '../../src/users/exceptions/email-field-change-not-allowed.exception';
import { UserNotFoundException } from '../../src/users/exceptions/user-not-found.exception';
import { EmailNotFoundException } from '../../src/users/exceptions/email-not-found.exception';

jest.mock('../../src/users/users.service', () => {
  return {
    UsersService: jest.fn().mockImplementation(() => ({
      findOne: jest.fn(),
      create: jest.fn(),
      validatePassword: jest.fn(),
      findAll: jest.fn(),
      findByEmail: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    })),
  };
});

describe('UsersService', () => {
  let usersService: UsersService;
  let userModel: Model<User>;

  const mockUser = {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    passwordHash: 'hashed_password',
    age: 30,
    speechDifficultyType: 'medium',
    roles: ['user'],
  } as Partial<User>;

  const createUserDto: CreateUserDto = {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    password: 'plain_password',
    age: 30,
  };

  beforeAll(() => {
    usersService = new UsersService(userModel);
  });

  it('should create a user', async () => {
    jest.spyOn(bcrypt, 'hash').mockImplementation(async () => 'hashed_password');
    jest.spyOn(usersService, 'create').mockResolvedValue(mockUser as User);

    const result = await usersService.create(createUserDto);

    expect(result).toEqual(mockUser);
    expect(result.passwordHash).toBe(mockUser.passwordHash);
  });

  it('should validate user password', async () => {
    jest.spyOn(usersService, 'validatePassword').mockResolvedValue(true);

    const isValid = await usersService.validatePassword(
      createUserDto.email,
      createUserDto.password,
    );

    expect(isValid).toBe(true);
  });

  it('should find user by email', async () => {
    jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as User);

    const result = await usersService.findByEmail(createUserDto.email);

    expect(result).toEqual(mockUser);
  });

  it('should update a user', async () => {
    const updateUserDto: UpdateUserDto = {
      name: 'Jane Smith',
    };

    const updatedUser = { ...mockUser, ...updateUserDto } as User;

    jest.spyOn(usersService, 'update').mockResolvedValue(updatedUser);

    const result = await usersService.update('someUserId', updateUserDto);

    expect(result).toEqual(updatedUser);
    expect(result.name).toBe(updateUserDto.name);
  });

  it('should remove a user', async () => {
    jest.spyOn(usersService, 'remove').mockResolvedValue(mockUser as User);

    const result = await usersService.remove('someUserId');

    expect(result).toEqual(mockUser);
  });

  it('should find all users', async () => {
    jest.spyOn(usersService, 'findAll').mockResolvedValue([mockUser as User]);

    const result = await usersService.findAll();

    expect(result).toEqual([mockUser]);
  });

  it('should find one user by ID', async () => {
    jest.spyOn(usersService, 'findOne').mockResolvedValue(mockUser as User);

    const result = await usersService.findOne('someUserId');

    expect(result).toEqual(mockUser);
  });

    it('should return false when validating password of a non-existent user', async () => {
    jest.spyOn(usersService, 'validatePassword').mockResolvedValue(false);

    const isValid = await usersService.validatePassword(
      'nonexistent@example.com',
      'wrong_password',
    );

    expect(isValid).toBe(false);
  });

  it('should throw NotFoundException when user not found by ID', async () => {
    jest
      .spyOn(usersService, 'findOne')
      .mockRejectedValue(new NotFoundException('User not found'));

    await expect(usersService.findOne('invalidUserId')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should return null when user not found by email', async () => {
    jest
      .spyOn(usersService, 'findByEmail').mockResolvedValue(null)
      .mockRejectedValue(new EmailNotFoundException('notfound@example.com'));

    await expect(
      usersService.findByEmail('notfound@example.com'),
    ).rejects.toThrow(EmailNotFoundException);
  });

  it('should throw NotFoundException when updating a non-existent user', async () => {
    jest
      .spyOn(usersService, 'update')
      .mockRejectedValue(new UserNotFoundException('invalidUserId'));

    await expect(
      usersService.update('invalidUserId', { name: 'Not Exists' }),
    ).rejects.toThrow(UserNotFoundException);
  });

  it('should throw NotFoundException when removing a non-existent user', async () => {
    jest
      .spyOn(usersService, 'remove')
      .mockRejectedValue(new UserNotFoundException('invalidUserId'));

    await expect(usersService.remove('invalidUserId')).rejects.toThrow(
      UserNotFoundException,
    );
  });

  it('should handle error during user creation', async () => {
    jest.spyOn(usersService, 'create').mockRejectedValue(new Error('DB Error'));

    await expect(usersService.create(createUserDto)).rejects.toThrow('DB Error');
  });

  it('should handle unexpected errors during findAll', async () => {
    jest.spyOn(usersService, 'findAll').mockRejectedValue(new Error('DB Error'));

    await expect(usersService.findAll()).rejects.toThrow('DB Error');
  });

  
  it('should throw error when trying to create user with negative age', async () => {
    const invalidUser = {
      name: 'Invalid User',
      email: 'invalid@example.com',
      password: '123456',
      age: -10,
    };

    jest
      .spyOn(usersService, 'create')
      .mockRejectedValue(new Error('Age cannot be negative'));

    await expect(usersService.create(invalidUser as any)).rejects.toThrow(
      'Age cannot be negative',
    );
  });

  it('should throw error if email already exists', async () => {
    const existingUser = {
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      password: '123456',
      age: 30,
    };

    jest
      .spyOn(usersService, 'create')
      .mockRejectedValue(new EmailAlreadyRegisteredException(existingUser.email));

    await expect(usersService.create(existingUser as any)).rejects.toThrow(
      EmailAlreadyRegisteredException,
    );
  });

  it('should handle error when updating with invalid data', async () => {
    const invalidUpdate = { age: -20 };
    jest
      .spyOn(usersService, 'update')
      .mockRejectedValue(new Error('Invalid data provided'));

    await expect(
      usersService.update('someUserId', invalidUpdate as any),
    ).rejects.toThrow('Invalid data provided');
  });
});
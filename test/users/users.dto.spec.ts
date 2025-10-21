import { validate } from 'class-validator';
import { CreateUserDto } from '../../src/users/dto/create-user.dto';
import { UpdateUserDto } from '../../src/users/dto/update-user.dto';

describe('User DTO validation', () => {
  it('should fail validation when email is invalid', async () => {
    const dto = new CreateUserDto();
    dto.name = 'John Doe';
    dto.email = 'invalid_email';
    dto.password = '123456';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isEmail');
  });

  it('should fail validation when password is too short', async () => {
    const dto = new CreateUserDto();
    dto.name = 'John Doe';
    dto.email = 'john@example.com';
    dto.password = '123'; // curto demais

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('minLength');
  });

  it('should fail validation when age is negative', async () => {
    const dto = new CreateUserDto();
    dto.name = 'John Doe';
    dto.email = 'john@example.com';
    dto.password = '123456';
    dto.age = -5; // inválido

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should pass validation with valid data', async () => {
    const dto = new CreateUserDto();
    dto.name = 'John Doe';
    dto.email = 'john@example.com';
    dto.password = '123456';
    dto.age = 25;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should allow partial update DTO', async () => {
    const dto = new UpdateUserDto();
    dto.name = 'Jane Updated';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});

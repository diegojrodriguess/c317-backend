import { validate } from 'class-validator';
import { LoginAuthDto } from '../../src/auth/dto/login-auth.dto';
import { RegisterAuthDto } from '../../src/auth/dto/register-auth.dto';

describe('Auth DTO validation', () => {
  // ========================
  // LOGIN DTO
  // ========================
  describe('LoginAuthDto', () => {
    it('should fail validation when email is invalid', async () => {
      const dto = new LoginAuthDto();
      dto.email = 'invalid_email';
      dto.password = '123456';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('should fail validation when password is too short', async () => {
      const dto = new LoginAuthDto();
      dto.email = 'john@example.com';
      dto.password = '123'; // too short

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('should fail validation when password exceeds max length', async () => {
      const dto = new LoginAuthDto();
      dto.email = 'john@example.com';
      dto.password = 'a'.repeat(70); // too long

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should pass validation with valid credentials', async () => {
      const dto = new LoginAuthDto();
      dto.email = 'john@example.com';
      dto.password = 'strongpass';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  // ========================
  // REGISTER DTO
  // ========================
  describe('RegisterAuthDto', () => {
    it('should fail when email is invalid', async () => {
      const dto = new RegisterAuthDto();
      dto.email = 'not-an-email';
      dto.password = '123456';
      dto.name = 'John Doe';
      dto.age = 25;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('should fail when password is too short', async () => {
      const dto = new RegisterAuthDto();
      dto.email = 'john@example.com';
      dto.password = '123';
      dto.name = 'John Doe';
      dto.age = 25;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('should fail when name contains invalid characters', async () => {
      const dto = new RegisterAuthDto();
      dto.email = 'john@example.com';
      dto.password = '123456';
      dto.name = 'John123'; // invalid chars
      dto.age = 25;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('matches');
    });

    it('should fail when name is too short', async () => {
      const dto = new RegisterAuthDto();
      dto.email = 'john@example.com';
      dto.password = '123456';
      dto.name = 'J';
      dto.age = 25;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('should fail when age is below minimum', async () => {
      const dto = new RegisterAuthDto();
      dto.email = 'john@example.com';
      dto.password = '123456';
      dto.name = 'John Doe';
      dto.age = 0; // invalid

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('min');
    });

    it('should fail when age exceeds maximum', async () => {
      const dto = new RegisterAuthDto();
      dto.email = 'john@example.com';
      dto.password = '123456';
      dto.name = 'John Doe';
      dto.age = 150; // invalid

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('max');
    });

    it('should fail when age is not an integer', async () => {
      const dto = new RegisterAuthDto();
      dto.email = 'john@example.com';
      dto.password = '123456';
      dto.name = 'John Doe';
      // @ts-ignore
      dto.age = 'twenty'; // invalid type

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isInt');
    });

    it('should pass validation with valid data', async () => {
      const dto = new RegisterAuthDto();
      dto.email = 'john@example.com';
      dto.password = 'strongpass';
      dto.name = 'John Doe';
      dto.age = 25;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });
});

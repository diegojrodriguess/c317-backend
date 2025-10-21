import { HttpException, HttpStatus } from '@nestjs/common';

export class EmailAlreadyRegisteredException extends HttpException {
  constructor(email: string) {
    super(`The email ${email} is already registered.`, HttpStatus.CONFLICT);
  }
}

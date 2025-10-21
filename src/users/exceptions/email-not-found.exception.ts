import { HttpException, HttpStatus } from '@nestjs/common';

export class EmailNotFoundException extends HttpException {
  constructor(email: string) {
    super(`${email} not found.`, HttpStatus.NOT_FOUND);
  }
}

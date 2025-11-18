import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
  constructor(id: string) {
    super(`User with ID ${id} not found.`, HttpStatus.NOT_FOUND);
  }
}

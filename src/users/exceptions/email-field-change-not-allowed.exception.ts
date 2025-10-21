import { HttpException, HttpStatus } from '@nestjs/common';

export class EmailFieldChangeNotAllowedException extends HttpException {
  constructor() {
    super('The email field cannot be changed after registration.', HttpStatus.BAD_REQUEST);
  }
}

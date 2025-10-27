import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
  constructor(userId: number | string) {
    super(`User with ID ${userId} not found`, HttpStatus.NOT_FOUND);
  }
}

export class LocationNotFoundException extends HttpException {
  constructor(locationId: number | string) {
    super(`Location with ID ${locationId} not found`, HttpStatus.NOT_FOUND);
  }
}

export class UnauthorizedAccessException extends HttpException {
  constructor(resource: string) {
    super(`Unauthorized access to ${resource}`, HttpStatus.FORBIDDEN);
  }
}

export class InvalidOperationException extends HttpException {
  constructor(message: string) {
    super(message, HttpStatus.BAD_REQUEST);
  }
}


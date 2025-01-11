import {
  BadRequestException,
  Injectable,
  PipeTransform,
  ValidationPipe as NestValidationPipe,
} from '@nestjs/common';

@Injectable()
export class ValidationPipe
  extends NestValidationPipe
  implements PipeTransform
{
  constructor() {
    super({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => ({
          field: error.property,
          message: Object.values(error.constraints)[0],
          value: error.value,
        }));

        return new BadRequestException({
          statusCode: 400,
          error: 'Validation Error',
          messages,
        });
      },
    });
  }
}

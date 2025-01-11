import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginDto } from '../../modules/auth/dto/login.dto';
import { RefreshTokenDto } from '../../modules/auth/dto/refresh-token.dto';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'login' })
  async login(@Payload() loginDto: LoginDto) {
    this.logger.log(`Login attempt for user: ${loginDto.email}`);
    return this.authService.login(loginDto);
  }

  @MessagePattern({ cmd: 'refresh_tokens' })
  async refreshTokens(@Payload() refreshTokenDto: RefreshTokenDto) {
    this.logger.log('Token refresh attempt');
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @MessagePattern({ cmd: 'validate_user' })
  async validateUser(@Payload() payload: { email: string; password: string }) {
    this.logger.log(`Validating user: ${payload.email}`);
    return this.authService.validateUser(payload.email, payload.password);
  }
}

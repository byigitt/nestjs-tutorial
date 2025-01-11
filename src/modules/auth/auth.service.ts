import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ConfigService } from '../../config/config.service';
import { IPasswordService } from './interfaces/password-service.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService implements IPasswordService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.validatePassword(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    const tokens = await this.getTokens(user._id.toString(), user.email);
    await this.updateRefreshToken(user._id.toString(), tokens.refresh_token);

    return {
      ...tokens,
      user: {
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
      },
    };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    let payload;
    try {
      payload = this.verifyToken(refreshTokenDto.refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findOne(payload.sub);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    try {
      const refreshTokenMatches = await this.validateRefreshToken(
        refreshTokenDto.refreshToken,
        user.refreshToken,
      );

      if (!refreshTokenMatches) {
        throw new UnauthorizedException('Access Denied');
      }

      const tokens = await this.getTokens(user._id.toString(), user.email);
      await this.updateRefreshToken(user._id.toString(), tokens.refresh_token);

      return tokens;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw error;
    }
  }

  async logout(userId: string) {
    return this.usersService.update(userId, { refreshToken: null } as any);
  }

  async validateUser(id: string) {
    const user = await this.usersService.findOne(id);
    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async validatePassword(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async validateRefreshToken(
    providedToken: string,
    storedToken: string,
  ): Promise<boolean> {
    return bcrypt.compare(providedToken, storedToken);
  }

  async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    } as any);
  }

  private async getTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.jwtSecret,
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.jwtSecret,
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private verifyToken(token: string) {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.jwtSecret,
      });
    } catch (error) {
      throw error.message;
    }
  }
}

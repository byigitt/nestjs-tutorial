import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../../modules/users/entities/user.entity';
import { LoginDto } from '../../modules/auth/dto/login.dto';
import { RefreshTokenDto } from '../../modules/auth/dto/refresh-token.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserLoginEvent } from '../../modules/users/events/user.events';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email, isActive: true });
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.validateUser(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.getTokens(user._id.toString(), user.email);
    await this.updateRefreshToken(user._id.toString(), tokens.refresh_token);

    // Emit login event
    this.eventEmitter.emit(
      UserLoginEvent.eventName,
      new UserLoginEvent(user, 'microservice', 'auth-service'),
    );

    return tokens;
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      const { sub: userId } = this.jwtService.verify(
        refreshTokenDto.refreshToken,
        {
          secret: this.configService.jwtSecret,
        },
      );

      const user = await this.userModel.findById(userId);
      if (!user || !user.refreshToken) {
        throw new UnauthorizedException('Access denied');
      }

      const refreshTokenMatches = await bcrypt.compare(
        refreshTokenDto.refreshToken,
        user.refreshToken,
      );

      if (!refreshTokenMatches) {
        throw new UnauthorizedException('Access denied');
      }

      const tokens = await this.getTokens(user._id.toString(), user.email);
      await this.updateRefreshToken(user._id.toString(), tokens.refresh_token);

      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async getTokens(userId: string, email: string) {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          email,
        },
        {
          secret: this.configService.jwtSecret,
          expiresIn: this.configService.jwtExpiration,
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
      access_token,
      refresh_token,
    };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.userModel
      .updateOne(
        { _id: userId },
        {
          refreshToken: hashedRefreshToken,
          lastLogin: new Date(),
        },
      )
      .exec();
  }
}

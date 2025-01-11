import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { ConfigService } from '../../../config/config.service';
import { Types } from 'mongoose';

describe('AuthService - Token Management', () => {
  let service: AuthService;
  const mockUser = {
    _id: new Types.ObjectId(),
    email: 'test@example.com',
  };

  const mockUsersService = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    jwtSecret: 'test-secret',
    jwtExpiration: '15m',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('Token Generation', () => {
    it('should generate access and refresh tokens with correct payload', async () => {
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';
      mockJwtService.signAsync.mockResolvedValueOnce(accessToken);
      mockJwtService.signAsync.mockResolvedValueOnce(refreshToken);

      const tokens = await service['getTokens'](
        mockUser._id.toString(),
        mockUser.email,
      );

      expect(tokens).toEqual({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      // Verify access token generation
      expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
        1,
        {
          sub: mockUser._id.toString(),
          email: mockUser.email,
        },
        {
          secret: mockConfigService.jwtSecret,
          expiresIn: '15m',
        },
      );

      // Verify refresh token generation
      expect(mockJwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        {
          sub: mockUser._id.toString(),
          email: mockUser.email,
        },
        {
          secret: mockConfigService.jwtSecret,
          expiresIn: '7d',
        },
      );
    });

    it('should handle JWT sign error for access token', async () => {
      const error = new Error('JWT sign error');
      mockJwtService.signAsync.mockRejectedValueOnce(error);

      await expect(
        service['getTokens'](mockUser._id.toString(), mockUser.email),
      ).rejects.toThrow('JWT sign error');
    });

    it('should handle JWT sign error for refresh token', async () => {
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockRejectedValueOnce(new Error('JWT sign error'));

      await expect(
        service['getTokens'](mockUser._id.toString(), mockUser.email),
      ).rejects.toThrow('JWT sign error');
    });
  });

  describe('Token Verification', () => {
    const validToken = 'valid-token';
    const invalidToken = 'invalid-token';

    it('should successfully verify a valid token', () => {
      const payload = { sub: mockUser._id.toString(), email: mockUser.email };
      mockJwtService.verify.mockReturnValue(payload);

      const result = service['verifyToken'](validToken);

      expect(result).toEqual(payload);
      expect(mockJwtService.verify).toHaveBeenCalledWith(validToken, {
        secret: mockConfigService.jwtSecret,
      });
    });

    it('should throw error for expired token', () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      expect(() => service['verifyToken'](invalidToken)).toThrow(
        'Token expired',
      );
    });

    it('should throw error for malformed token', () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Malformed token');
      });

      expect(() => service['verifyToken'](invalidToken)).toThrow(
        'Malformed token',
      );
    });

    it('should throw error when secret is invalid', () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid secret');
      });

      expect(() => service['verifyToken'](validToken)).toThrow(
        'Invalid secret',
      );
    });
  });
});

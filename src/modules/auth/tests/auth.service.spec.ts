import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { ConfigService } from '../../../config/config.service';
import { UnauthorizedException } from '@nestjs/common';
import { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;

  const mockUser = {
    _id: new Types.ObjectId(),
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    roles: ['user'],
    isActive: true,
    password: 'hashedPassword',
    refreshToken: 'hashedRefreshToken',
  };

  const mockUsersService = {
    validatePassword: jest.fn(),
    findOne: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
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

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully login a user', async () => {
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValueOnce(accessToken);
      mockJwtService.signAsync.mockResolvedValueOnce(refreshToken);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));

      const result = await service.login(loginDto);

      expect(result).toEqual({
        access_token: accessToken,
        refresh_token: refreshToken,
        user: {
          id: mockUser._id.toString(),
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          roles: mockUser.roles,
        },
      });

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockJwtService.signAsync).toHaveBeenCalledTimes(2);
      expect(mockUsersService.update).toHaveBeenCalledWith(
        mockUser._id.toString(),
        expect.objectContaining({
          refreshToken: expect.any(String),
        }),
      );
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials'),
      );
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
      expect(mockUsersService.update).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      mockUsersService.findByEmail.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('User is inactive'),
      );
      expect(mockJwtService.signAsync).not.toHaveBeenCalled();
      expect(mockUsersService.update).not.toHaveBeenCalled();
    });

    it('should handle bcrypt hash error during refresh token update', async () => {
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockResolvedValueOnce(accessToken);
      mockJwtService.signAsync.mockResolvedValueOnce(refreshToken);
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.reject(new Error('Hash error')));

      await expect(service.login(loginDto)).rejects.toThrow('Hash error');
      expect(mockUsersService.update).not.toHaveBeenCalled();
    });

    it('should handle JWT sign error', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockJwtService.signAsync.mockRejectedValue(new Error('JWT sign error'));

      await expect(service.login(loginDto)).rejects.toThrow('JWT sign error');
      expect(mockUsersService.update).not.toHaveBeenCalled();
    });
  });

  describe('refreshTokens', () => {
    const refreshTokenDto = {
      refreshToken: 'valid-refresh-token',
    };

    it('should successfully refresh tokens', async () => {
      const accessToken = 'new-access-token';
      const newRefreshToken = 'new-refresh-token';
      const userId = mockUser._id.toString();

      mockJwtService.verify.mockReturnValue({ sub: userId });
      mockUsersService.findOne.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve('hashedRefreshToken'));
      mockJwtService.signAsync.mockResolvedValueOnce(accessToken);
      mockJwtService.signAsync.mockResolvedValueOnce(newRefreshToken);

      const result = await service.refreshTokens(refreshTokenDto);

      expect(result).toEqual({
        access_token: accessToken,
        refresh_token: newRefreshToken,
      });
      expect(mockJwtService.verify).toHaveBeenCalledWith(
        refreshTokenDto.refreshToken,
        { secret: mockConfigService.jwtSecret },
      );
      expect(mockUsersService.findOne).toHaveBeenCalledWith(userId);
      expect(mockUsersService.update).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          refreshToken: expect.any(String),
        }),
      );
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error();
      });

      await expect(service.refreshTokens(refreshTokenDto)).rejects.toThrow(
        new UnauthorizedException('Invalid refresh token'),
      );
      expect(mockUsersService.findOne).not.toHaveBeenCalled();
      expect(mockUsersService.update).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 'user-id' });
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(service.refreshTokens(refreshTokenDto)).rejects.toThrow(
        new UnauthorizedException('Access Denied'),
      );
      expect(mockUsersService.update).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user has no refresh token', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 'user-id' });
      mockUsersService.findOne.mockResolvedValue({
        ...mockUser,
        refreshToken: null,
      });

      await expect(service.refreshTokens(refreshTokenDto)).rejects.toThrow(
        new UnauthorizedException('Access Denied'),
      );
      expect(mockUsersService.update).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when refresh token does not match', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 'user-id' });
      mockUsersService.findOne.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      await expect(service.refreshTokens(refreshTokenDto)).rejects.toThrow(
        new UnauthorizedException('Access Denied'),
      );
      expect(mockUsersService.update).not.toHaveBeenCalled();
    });

    it('should handle bcrypt compare error', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 'user-id' });
      mockUsersService.findOne.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.reject(new Error('Compare error')));

      await expect(service.refreshTokens(refreshTokenDto)).rejects.toThrow(
        'Compare error',
      );
      expect(mockUsersService.update).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      const userId = 'user-id';
      mockUsersService.update.mockResolvedValue({ affected: 1 });

      await service.logout(userId);

      expect(mockUsersService.update).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({ refreshToken: null }),
      );
    });

    it('should handle update error during logout', async () => {
      const userId = 'user-id';
      const error = new Error('Update failed');
      mockUsersService.update.mockRejectedValue(error);

      await expect(service.logout(userId)).rejects.toThrow(error);
    });
  });

  describe('validateUser', () => {
    const userId = 'user-id';

    it('should return user when valid and active', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser(userId);

      expect(result).toEqual(mockUser);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(userId);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(service.validateUser(userId)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      mockUsersService.findOne.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(service.validateUser(userId)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should handle database error during user validation', async () => {
      const error = new Error('Database error');
      mockUsersService.findOne.mockRejectedValue(error);

      await expect(service.validateUser(userId)).rejects.toThrow(error);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../../../config/config.service';
import { Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

describe('AuthService - Password Management', () => {
  let service: AuthService;

  const mockUser = {
    _id: new Types.ObjectId(),
    email: 'test@example.com',
    password: 'hashedPassword',
    refreshToken: 'hashedRefreshToken',
    isActive: true,
  };

  const mockUsersService = {
    findOne: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
    validatePassword: jest.fn(),
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockConfigService = {
    jwtSecret: 'test-secret',
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

  describe('Password Validation', () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should successfully validate correct password', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));

      const result = await service.validatePassword(
        credentials.email,
        credentials.password,
      );

      expect(result).toBe(mockUser);
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        credentials.email,
      );
    });

    it('should reject invalid password', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      const result = await service.validatePassword(
        credentials.email,
        'wrongpassword',
      );

      expect(result).toBeNull();
      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        credentials.email,
      );
    });

    it('should handle bcrypt compare error', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.reject(new Error('Compare failed')));

      await expect(
        service.validatePassword(credentials.email, credentials.password),
      ).rejects.toThrow('Compare failed');
    });
  });

  describe('Refresh Token Hashing', () => {
    const refreshToken = 'refresh-token';

    it('should successfully hash refresh token', async () => {
      const hashedToken = 'hashed-refresh-token';
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve(hashedToken));

      await service['updateRefreshToken'](
        mockUser._id.toString(),
        refreshToken,
      );

      expect(mockUsersService.update).toHaveBeenCalledWith(
        mockUser._id.toString(),
        expect.objectContaining({ refreshToken: hashedToken }),
      );
    });

    it('should handle bcrypt hash error', async () => {
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.reject(new Error('Hash failed')));

      await expect(
        service['updateRefreshToken'](mockUser._id.toString(), refreshToken),
      ).rejects.toThrow('Hash failed');
      expect(mockUsersService.update).not.toHaveBeenCalled();
    });

    it('should handle database update error', async () => {
      const hashedToken = 'hashed-refresh-token';
      jest
        .spyOn(bcrypt, 'hash')
        .mockImplementation(() => Promise.resolve(hashedToken));

      const error = new Error('Update failed');
      mockUsersService.update.mockRejectedValue(error);

      await expect(
        service['updateRefreshToken'](mockUser._id.toString(), refreshToken),
      ).rejects.toThrow('Update failed');
    });
  });

  describe('Refresh Token Validation', () => {
    const storedToken = 'stored-hashed-token';
    const providedToken = 'provided-token';

    it('should successfully validate matching refresh token', async () => {
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(true));

      const isValid = await service['validateRefreshToken'](
        providedToken,
        storedToken,
      );

      expect(isValid).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(providedToken, storedToken);
    });

    it('should reject non-matching refresh token', async () => {
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.resolve(false));

      const isValid = await service['validateRefreshToken'](
        providedToken,
        storedToken,
      );

      expect(isValid).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith(providedToken, storedToken);
    });

    it('should handle bcrypt compare error', async () => {
      jest
        .spyOn(bcrypt, 'compare')
        .mockImplementation(() => Promise.reject(new Error('Compare failed')));

      await expect(
        service['validateRefreshToken'](providedToken, storedToken),
      ).rejects.toThrow('Compare failed');
    });
  });
});

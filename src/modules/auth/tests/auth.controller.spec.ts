import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { Types } from 'mongoose';

describe('AuthController', () => {
  let controller: AuthController;

  const mockUser = {
    _id: new Types.ObjectId(),
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    roles: ['user'],
    isActive: true,
  };

  const mockAuthService = {
    login: jest.fn(),
    refreshTokens: jest.fn(),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return login response', async () => {
      const expectedResponse = {
        access_token: 'access-token',
        refresh_token: 'refresh-token',
        user: {
          id: mockUser._id.toString(),
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          roles: mockUser.roles,
        },
      };

      mockAuthService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('refresh', () => {
    const refreshTokenDto = {
      refreshToken: 'valid-refresh-token',
    };

    it('should return new tokens', async () => {
      const expectedResponse = {
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
      };

      mockAuthService.refreshTokens.mockResolvedValue(expectedResponse);

      const result = await controller.refresh(refreshTokenDto);

      expect(result).toEqual(expectedResponse);
      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith(
        refreshTokenDto,
      );
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const req = {
        user: {
          _id: mockUser._id,
        },
      };

      mockAuthService.logout.mockResolvedValue(undefined);

      const result = await controller.logout(req);

      expect(result).toEqual({ message: 'Logout successful' });
      expect(mockAuthService.logout).toHaveBeenCalledWith(
        mockUser._id.toString(),
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile', () => {
      const req = {
        user: mockUser,
      };

      const result = controller.getProfile(req);

      expect(result).toEqual(mockUser);
    });
  });
});

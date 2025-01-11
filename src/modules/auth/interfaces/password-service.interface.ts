export interface IPasswordService {
  validatePassword(email: string, password: string): Promise<any>;
  validateRefreshToken(
    providedToken: string,
    storedToken: string,
  ): Promise<boolean>;
  updateRefreshToken(userId: string, refreshToken: string): Promise<void>;
}

import { AuthService } from './auth.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
jest.mock('../helpers/utils', () => ({
  hashPassword: jest.fn((str) => Promise.resolve('hashed-' + str)),
  handleSuccess: jest.fn((message, status, data) => ({
    success: true,
    message,
    status,
    data, // ✅ properly pass token and other info
  })),
  handleError: jest.fn((message) => ({
    success: false,
    message,
  })),
}));

describe('AuthService', () => {
  let service: AuthService;
  let mockPrisma: any;
  let mockJwtService: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
      },
    };

    mockJwtService = {
      signAsync: jest.fn(),
    };

    service = new AuthService(mockPrisma, mockJwtService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'uuid-1234',
        email: 'test@mail.com',
      });

      const response = await service.register({
        input: {
          email: 'test@mail.com',
          password: 'password123',
          biometricKey: 'bio123',
        },
      });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@mail.com' },
      });

      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(response.success).toBe(true);
    });

    it('should return error if user already exists', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'uuid-1' });

      const response = await service.register({
        input: {
          email: 'test@mail.com',
          password: 'password123',
          biometricKey: 'bio123',
        },
      });

      expect(response.success).toBe(false);
      expect(response.message).toBe('Account already exists. Please login.');
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const user = {
        id: 'uuid-1',
        email: 'test@mail.com',
        password: 'hashed-password',
      };

      mockPrisma.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('jwt-token');

      const response = await service.login({
        input: { email: 'test@mail.com', password: 'password123' },
      });

      expect(response.success).toBe(true);
      expect(response.data.token).toBe('jwt-token');
    });

    it('should return error if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await service.login({
        input: { email: 'no@mail.com', password: 'pass' },
      });

      expect(response.success).toBe(false);
      expect(response.message).toBe(
        'Invalid login credentials. Please check and try again.',
      );
    });

    it('should return error if password does not match', async () => {
      const user = {
        id: 'uuid-1',
        email: 'test@mail.com',
        password: 'hashed-password',
      };

      mockPrisma.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const response = await service.login({
        input: { email: 'test@mail.com', password: 'wrong-password' },
      });

      expect(response.success).toBe(false);
      expect(response.message).toBe(
        'Invalid login credentials. Please check and try again.',
      );
    });
  });

  describe('biometricLogin', () => {
    it('should login successfully with valid biometricKey', async () => {
      const users = [
        { id: 'uuid-1', email: 'bio@mail.com', biometricKey: 'hashed-bio123' },
      ];

      mockPrisma.user.findMany.mockResolvedValue(users);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('bio-token');

      const response = await service.biometricLogin({
        input: { biometricKey: 'bio123' },
      });

      expect(response.success).toBe(true);
      expect(response.data.token).toBe('bio-token');
    });

    it('should return error if no match for biometricKey', async () => {
      const users = [
        { id: 'uuid-1', email: 'bio@mail.com', biometricKey: 'hashed-bio123' },
      ];

      mockPrisma.user.findMany.mockResolvedValue(users);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const response = await service.biometricLogin({
        input: { biometricKey: 'wrong-bio' },
      });

      expect(response.success).toBe(false);
      expect(response.message).toBe(
        'Biometric data does not match. Please try again.',
      );
    });
  });
});

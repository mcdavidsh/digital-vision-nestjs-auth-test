import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import {
  handleError,
  handleSuccess,
  hashPassword,
  ResponseInterface,
} from '../helpers/Utils';
import { PrismaService } from '../prisma/prisma.service';
import { LoginUserInput, RegisterUserInput } from './dto/Auth';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService, // PrismaService to interact with the database
    private jwtService: JwtService, // JWT service to issue authentication tokens
  ) {}

  /**
   * Register a new user
   * @param input - user registration data (email, password)
   */
  async register({
    input,
  }: {
    input: RegisterUserInput;
  }): Promise<ResponseInterface<any>> {
    try {
      const { email, password, biometricKey } = input;

      // Check if a user with the same email already exists
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        // Return an error response if user already exists
        return handleError('Account already exists. Please login.');
      }

      let hashedKey: string | null;
      if (biometricKey) {
        // Hash the user's password for secure storage
        hashedKey = await hashPassword(biometricKey);
      }
      // Hash the user's password for secure storage
      const hashedPassword = await hashPassword(password);

      // Create and store the new user in the database
      const newUser = await this.prisma.user.create({
        data: {
          email,
          biometricKey: hashedKey,
          password: hashedPassword,
        },
      });

      // Return a success response with the new user data
      return handleSuccess('User created successfully', 201, {
        ...newUser,
      });
    } catch (error: any) {
      console.error('Error during registration:', error); // Log error details
      return handleError(
        error.message || 'An error occurred during registration',
      );
    }
  }

  /**
   * Login a user
   * @param input - login credentials (email and password)
   */
  async login({
    input,
  }: {
    input: LoginUserInput;
  }): Promise<ResponseInterface<any>> {
    try {
      const { email, password } = input;

      // Find user by email
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      // Return error if user is not found
      if (!user) {
        return await handleError(
          'Invalid login credentials. Please check and try again.',
        );
      }

      // Compare the provided password with the hashed password in DB
      const hashedPassword = await bcrypt.compare(password, user?.password);
      if (!hashedPassword) {
        // Return error if password does not match
        return await handleError(
          'Invalid login credentials. Please check and try again.',
        );
      }

      // Generate JWT token for authenticated user
      const token = await this.jwtService.signAsync({ userId: user.id });

      // Return success response with token and user data
      return await handleSuccess('Login successful', 200, {
        token,
        ...user,
      });
    } catch (error: any) {
      // Catch and return any unexpected error
      return await handleError(error.message);
    }
  }

  /**
   * Login a user using biometric data
   * @param input - biometric key data
   */

  async biometricLogin({
    input,
  }: {
    input: { biometricKey: string };
  }): Promise<ResponseInterface<any>> {
    try {
      const { biometricKey } = input;

      // Fetch all users with a stored biometricKey
      const usersWithBiometric = await this.prisma.user.findMany({
        where: {
          biometricKey: { not: null },
        },
      });

      // Attempt to find a user whose stored biometricKey matches the input
      let matchedUser = null;
      for (const user of usersWithBiometric) {
        const isMatch = await bcrypt.compare(biometricKey, user.biometricKey);
        if (isMatch) {
          matchedUser = user;
          break;
        }
      }

      // If no match found, return error
      if (!matchedUser) {
        return await handleError(
          'Biometric data does not match. Please try again.',
        );
      }

      // Generate token
      const token = await this.jwtService.signAsync({ userId: matchedUser.id });

      // Return success response with token and user info
      return await handleSuccess('Biometric Login successful', 200, {
        token,
        ...matchedUser,
      });
    } catch (error: any) {
      return await handleError(error.message || 'Biometric login failed');
    }
  }
}

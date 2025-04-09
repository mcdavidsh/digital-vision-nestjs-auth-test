import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from 'src/app.module';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // Register Mutation
  const registerMutation = `
    mutation Register($email: String!, $password: String!, $biometricKey: String!) {
      register(email: $email, password: $password, biometricKey: $biometricKey) {
        success
        message
        data {
          id
          email
        }
      }
    }
  `;

  // Login Mutation
  const loginMutation = `
    mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        success
        message
        data {
          token
        }
      }
    }
  `;

  // Biometric Login Mutation
  const biometricLoginMutation = `
    mutation BiometricLogin($biometricKey: String!) {
      biometricLogin(biometricKey: $biometricKey) {
        success
        message
        data {
          token
        }
      }
    }
  `;

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const registerData = {
        email: 'test@mail.com',
        password: 'password123',
        biometricKey: 'bio123',
      };

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: registerMutation,
          variables: registerData,
        })
        .expect(200);

      expect(response.body.data.register.success).toBe(true);
      expect(response.body.data.register.message).toBe(
        'User registered successfully',
      );
      expect(response.body.data.register.data).toHaveProperty('id');
      expect(response.body.data.register.data.email).toBe(registerData.email);
    });

    it('should return error if user already exists', async () => {
      const registerData = {
        email: 'test@mail.com',
        password: 'password123',
        biometricKey: 'bio123',
      };

      // Register the user first
      await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: registerMutation,
          variables: registerData,
        })
        .expect(200);

      // Attempt to register the same user again
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: registerMutation,
          variables: registerData,
        })
        .expect(200);

      expect(response.body.data.register.success).toBe(false);
      expect(response.body.data.register.message).toBe(
        'Account already exists. Please login.',
      );
    });
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@mail.com',
        password: 'password123',
      };

      // Register the user first
      await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: registerMutation,
          variables: {
            email: loginData.email,
            password: loginData.password,
            biometricKey: 'bio123',
          },
        })
        .expect(200);

      // Then, attempt to log in with valid credentials
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: loginMutation,
          variables: loginData,
        })
        .expect(200);

      expect(response.body.data.login.success).toBe(true);
      expect(response.body.data.login.data.token).toBeDefined();
    });

    it('should return error if user not found during login', async () => {
      const loginData = {
        email: 'nonexistent@mail.com',
        password: 'password123',
      };

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: loginMutation,
          variables: loginData,
        })
        .expect(200);

      expect(response.body.data.login.success).toBe(false);
      expect(response.body.data.login.message).toBe(
        'Invalid login credentials. Please check and try again.',
      );
    });

    it('should return error if password does not match', async () => {
      const loginData = {
        email: 'test@mail.com',
        password: 'wrong-password',
      };

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: loginMutation,
          variables: loginData,
        })
        .expect(200);

      expect(response.body.data.login.success).toBe(false);
      expect(response.body.data.login.message).toBe(
        'Invalid login credentials. Please check and try again.',
      );
    });
  });

  describe('biometricLogin', () => {
    it('should login successfully with valid biometricKey', async () => {
      const biometricLoginData = {
        biometricKey: 'bio123',
      };

      // Register the user first with biometric key
      await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: registerMutation,
          variables: {
            email: 'bio@mail.com',
            password: 'password123',
            biometricKey: 'bio123',
          },
        })
        .expect(200);

      // Attempt to log in with valid biometricKey
      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: biometricLoginMutation,
          variables: biometricLoginData,
        })
        .expect(200);

      expect(response.body.data.biometricLogin.success).toBe(true);
      expect(response.body.data.biometricLogin.data.token).toBeDefined();
    });

    it('should return error if biometricKey does not match', async () => {
      const biometricLoginData = {
        biometricKey: 'wrong-bio',
      };

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .send({
          query: biometricLoginMutation,
          variables: biometricLoginData,
        })
        .expect(200);

      expect(response.body.data.biometricLogin.success).toBe(false);
      expect(response.body.data.biometricLogin.message).toBe(
        'Biometric data does not match. Please try again.',
      );
    });
  });
});

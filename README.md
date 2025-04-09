# NestJS Backend Test Task

## Description

This project is a **NestJS** backend implementation built using **TypeScript**, offering a **GraphQL** API for user registration and authentication (standard and biometric). The application uses **Prisma ORM** with a **PostgreSQL** database to handle user data.

### Features
- **User Registration:** Register users with email and password.
- **Standard Login:** Log in users using email and password (hashed).
- **Biometric Login:** Authenticate users using a unique biometric key.
- **JWT Authentication:** Use JSON Web Tokens (JWT) for secure authentication.
- **GraphQL API:** Exposes API endpoints through GraphQL.
- **Prisma & Postgres:** Communicate and store data with Prisma Postgres.

---

## Installation

To get started with this project, follow these steps:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/mcdavidsh/digital-vision-nestjs-auth-test
   cd digital-vision-nestjs-auth-test
   ```

2. **Install Dependencies:**
   Make sure you have pnpm installed. If not, install it using `npm install -g pnpm`.

   Then, run the following command to install all dependencies:
   ```bash
   pnpm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the root directory and configure the environment variables for your PostgreSQL database connection:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"
   JWT_SECRET="your_jwt_secret"
   ```
   Replace `user`, `password`, and `mydb` with your actual PostgreSQL credentials.

4. **Database Setup:**
   Initialize the PostgreSQL database and Prisma:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

## Running the App

### Development
To run the app in development mode (with hot reloading), execute:
```bash
pnpm run start:dev
```
This will start the server on the default port 3000.

### Production
For production, you can build and run the app as follows:
```bash
pnpm run start:prod
```

## Testing

NestJS uses Jest as the testing framework. To run the tests, you can use the following commands:

### Unit Tests
```bash
pnpm run test
```

### Test Coverage
To generate a test coverage report:
```bash
pnpm run test:cov
```

## Features and GraphQL Mutations

### User Registration
**Mutation:** `register(email: String!, password: String!)`

**Description:** Register a new user with an email and password. The password will be hashed before storage.

**Arguments:**
- `email` (String): The user's email address (must be unique).
- `password` (String): The user's password.

**Response:** The created User object.

### Standard Login
**Mutation:** `login(email: String!, password: String!)`

**Description:** Log in a user with email and password. The password is compared with the hashed password stored in the database.

**Arguments:**
- `email` (String): The user's email address.
- `password` (String): The user's password.

**Response:** A JWT token for authenticating the user.

### Biometric Login
**Mutation:** `biometricLogin(biometricKey: String!)`

**Description:** Authenticate a user with a unique biometric key (simulated string).

**Arguments:**
- `biometricKey` (String): The user's unique biometric key (simulated string).

**Response:** A JWT token for authenticating the user.

## Postman/GraphQL Testing

You can test the API using GraphQL. Here's an example of the queries/mutations you can run using Postman or any GraphQL client.

### Sample Queries

**Register User:**
```graphql
mutation {
  register(input: { email: "mcdavidobioha@gmail.com", password: "123456", biometricKey: "hello@" }) {
    message
    status
    success
    data {
      id
      email
    }
  }
}
```

**Login User (Standard):**
```graphql
mutation {
  login(input: { email: "test@tt.com", password: "123456" }) {
    message
    status
    success
    data {
      token
    }
  }
}
```

**Biometric Login:**
```graphql
mutation {
  biometricLogin(input: { biometricKey: "hello@" }) {
    message
    status
    success
    data {
      token
    }
  }
}
```

## Documentation

### API Endpoints
- **POST /graphql**: Main entry point for GraphQL queries and mutations.

### Example GraphQL Schema
```graphql
type User {
  id: Int!
  email: String!
  password: String!
  biometricKey: String
  createdAt: Date!
  updatedAt: Date!
}
type Query {
  healthCheck: String!
}
type Mutation {
  register(input: RegisterUserInput!): RegisterResponse!
  login(input: LoginUserInput!): LoginResponse!
  biometricLogin(input: BiometricLoginInput!): LoginResponse!
}

input RegisterUserInput {
  email: String!
  biometricKey: String!
  password: String!
}

input LoginUserInput {
  email: String!
  password: String!
}

input BiometricLoginInput {
  biometricKey: String!
}
```

### Project Structure
Here's an overview of the project structure:

```
src/
 modules/
 ├── auth/
 │   ├── auth.module.ts
 │   ├── auth.service.ts
 │   ├── auth.resolver.ts
 │   ├── auth.service.spec.ts
 │   |─── dto/
 │       ├── Auth.ts
 │       ├── BiometricLoginResponse.ts
 │       ├── LoginResponse.ts
 │       ├── RegisterResponse.ts
 │   |── entities/
 │       ├── user.entity.ts
├── app.module.ts
├── main.ts
prisma/
├── schema.prisma
└── migrations/
```
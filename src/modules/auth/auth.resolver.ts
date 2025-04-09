import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import {
  BiometricLoginInput,
  LoginUserInput,
  RegisterUserInput,
} from './dto/Auth';
import { RegisterResponse } from './dto/RegisterResponse';
import { LoginResponse } from './dto/LoginResponse';

@Resolver(() => User)
export class AuthResolver {
  constructor(private readonly usersService: AuthService) {}

  @Query(() => String)
  healthCheck() {
    return 'GraphQL is up and running';
  }
  @Mutation(() => RegisterResponse)
  async register(@Args('input') input: RegisterUserInput) {
    console.log('input', input);
    return await this.usersService.register({ input });
  }

  @Mutation(() => LoginResponse)
  async login(@Args('input') input: LoginUserInput) {
    return await this.usersService.login({ input });
  }

  @Mutation(() => LoginResponse)
  async biometricLogin(@Args('input') input: BiometricLoginInput) {
    return await this.usersService.biometricLogin({ input });
  }
}

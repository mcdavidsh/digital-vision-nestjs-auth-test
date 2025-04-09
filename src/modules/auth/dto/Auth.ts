import { InputType, Int, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, isString, MinLength } from 'class-validator';

@InputType()
export class RegisterUserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  biometricKey?: string;

  @Field()
  @MinLength(5, { message: 'Password must be at least 5 characters long' })
  password: string;
}

@InputType()
export class LoginUserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @MinLength(5, { message: 'Password must be at least 5 characters long' })
  password: string;
}

@InputType()
export class BiometricLoginInput {
  @Field()
  @IsNotEmpty()
  biometricKey: string;
}

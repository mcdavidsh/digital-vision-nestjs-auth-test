import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';

@ObjectType()
export class RegisterResponse {
  @Field()
  message: string;

  @Field()
  status: number;

  @Field()
  success: boolean;

  @Field(() => User, { nullable: true })
  data?: User;
}

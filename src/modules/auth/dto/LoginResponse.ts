import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LoginData {
  @Field()
  token: string | null;
}

@ObjectType()
export class LoginResponse {
  @Field()
  message: string;

  @Field()
  status: number;

  @Field()
  success: boolean;

  @Field(() => LoginData, { nullable: true })
  data?: LoginData | null;
}

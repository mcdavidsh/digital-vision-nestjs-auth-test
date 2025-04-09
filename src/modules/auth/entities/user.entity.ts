import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field()
  id: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field({ nullable: true })
  fingerprint: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

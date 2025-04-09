import { IsString, Length } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class BiometricLoginInput {
  @Field()
  @IsString()
  @Length(32, 128) // Enforce length to simulate secure keys
  biometricKey: string;
}

import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    AuthModule, // <--- need to add here too
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: 'schema.gql',
    }),
    ConfigModule.forRoot({
      isGlobal: true, // Makes env variables available app-wide
    }),
  ],
})
export class AppModule {}

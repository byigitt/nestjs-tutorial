import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '../../config/config.module';
import { ConfigService } from '../../config/config.service';
import { join } from 'path';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        playground: configService.graphqlPlayground,
        debug: configService.graphqlDebug,
        sortSchema: configService.graphqlSortSchema,
        introspection: configService.graphqlIntrospection,
        autoSchemaFile: join(process.cwd(), configService.graphqlSchemaPath),
        buildSchemaOptions: {
          numberScalarMode: 'integer',
          dateScalarMode: 'timestamp',
        },
        context: ({ req, res }) => ({ req, res }),
        cors: {
          origin: true,
          credentials: true,
        },
        formatError: (error) => {
          const graphQLFormattedError = {
            message: error.message,
            code: error.extensions?.code || 'INTERNAL_SERVER_ERROR',
            locations: error.locations,
            path: error.path,
          };
          return graphQLFormattedError;
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class GraphqlModule {}

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import mongoConfig from './config/mongo.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mongoConfig],
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('mongo.host');
        const port = configService.get<number>('mongo.port');
        const user = configService.get<string>('mongo.user');
        const pass = configService.get<string>('mongo.pass');
        const dbName = configService.get<string>('mongo.dbName');

        return {
          uri: `mongodb://${user}:${pass}@${host}:${port}/${dbName}?authSource=admin`,
        };
      },
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

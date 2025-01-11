import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import * as mongoose from 'mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { TwilioModule } from './twilio/twilio.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes .env variables accessible globally
    }),
    MongooseModule.forRoot(process.env.database),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    UserModule,
    AuthModule,
    TwilioModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

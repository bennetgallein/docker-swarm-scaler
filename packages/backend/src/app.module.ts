import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { DockerModule } from './docker/docker.module';
import { HttpModule } from '@nestjs/axios';
import { PromModule } from './prom/prom.module';

@Module({
  imports: [
    // ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    HttpModule,
    DockerModule,
    PromModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

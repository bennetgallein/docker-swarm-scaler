import { Module } from '@nestjs/common';
import { DockerService } from './docker.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [DockerService],
  exports: [DockerService],
})
export class DockerModule {}

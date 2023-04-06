import { Module } from '@nestjs/common';
import { PromService } from './prom.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [PromService],
  exports: [PromService],
})
export class PromModule {}

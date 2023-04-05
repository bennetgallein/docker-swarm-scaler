import { Module } from '@nestjs/common';
import { PromService } from './prom.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [PromService],
  exports: [PromService],
})
export class PromModule {}

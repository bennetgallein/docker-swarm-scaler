import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/containers')
  getContainers() {
    return this.appService.getContainers();
  }

  @Get('/metrics')
  getMetrics() {
    return this.appService.getMetrics();
  }

  @Get('/test')
  test() {
    return this.appService.handle();
  }
}

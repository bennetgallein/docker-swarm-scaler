import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PromService {
  constructor(private readonly httpService: HttpService) {}

  async loadMetrics() {
    const res = await firstValueFrom(
      this.httpService.get(
        `http://localhost:9090/api/v1/query?query=sum(rate(container_cpu_usage_seconds_total%7Bcontainer_label_com_docker_swarm_task_name%3D~%27.%2B%27%7D%5B5m%5D))BY(container_label_com_docker_swarm_service_name%2Cinstance)*100`,
      ),
    );
    return res.data;
  }
}

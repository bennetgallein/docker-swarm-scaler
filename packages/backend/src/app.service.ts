import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  LOWER_THRESHOLD,
  MAX_LABEL,
  MIN_LABEL,
  UPPER_THRESHOLD,
} from './constants';
import { DockerService } from './docker/docker.service';
import { PromService } from './prom/prom.service';

@Injectable()
export class AppService {
  private logger = new Logger(AppService.name);

  constructor(
    private readonly docker: DockerService,
    private readonly prom: PromService,
  ) {}

  async getMetrics() {
    return this.prom.loadMetrics();
  }

  getContainers() {
    return this.docker.getService('test-stack_hello');
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handle() {
    this.logger.log('Starting check');
    // do the logic here
    const metrics = await this.getMetrics();

    return await Promise.all(
      metrics.data.result.map(async (singleMetric) => {
        // load service to metric
        const serviceName =
          singleMetric.metric.container_label_com_docker_swarm_service_name;
        const service = await this.docker.getService(serviceName);
        // service does not exist or label is not set to enable scaling
        if (!service.length) return;
        const singleService = service[0];
        if (!singleService.Spec.Mode.Replicated) return;
        this.logger.verbose('Found replicated service: ' + serviceName);
        const labels = singleService.Spec.Labels;
        const currentReplicaCount = singleService.Spec.Mode.Replicated.Replicas;

        // check if current metric is either above or below the configured threshold
        const metric = Number(singleMetric.value[1]);
        // upper and lower limit - a healthy service in idle would sit between the two.
        const lowerThreshold = Number(labels[LOWER_THRESHOLD]) || 25; // limit to reach before scaling DOWN
        const upperThreshold = Number(labels[UPPER_THRESHOLD]) || 85; // limit to reach before scaling UP

        const minCount = Number(labels[MIN_LABEL]);
        const maxCount = Number(labels[MAX_LABEL]);

        if (metric < lowerThreshold && currentReplicaCount > minCount) {
          // scale down
          await this.docker.scaleService(serviceName, currentReplicaCount - 1);
          this.logger.log(
            `Scaled service ${serviceName} from ${currentReplicaCount} to ${
              currentReplicaCount - 1
            }`,
          );
        }

        if (metric > upperThreshold && currentReplicaCount < maxCount) {
          // scale up
          await this.docker.scaleService(serviceName, currentReplicaCount + 1);
          this.logger.log(
            `Scaled service ${serviceName} from ${currentReplicaCount} to ${
              currentReplicaCount + 1
            }`,
          );
        }

        return service;
      }),
    );
  }
}

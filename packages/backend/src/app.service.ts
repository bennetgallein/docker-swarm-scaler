import { Injectable } from '@nestjs/common';
import { DockerService } from './docker/docker.service';
import {
  ASSUME_LABEL,
  LOWER_THRESHOLD,
  MAX_LABEL,
  MIN_LABEL,
  UPPER_THRESHOLD,
} from './constants';
import { PromService } from './prom/prom.service';
import { log } from 'console';

@Injectable()
export class AppService {
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

  async handle() {
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
        const labels = service[0].Spec.Labels;
        const currentReplicaCount = service[0].Spec.Mode.Replicated.Replicas;

        // check if current metric is either above or below the configured threshold
        const metric = Number(singleMetric.value[1]);
        // upper and lower limit - a healthy service in idle would sit between the two.
        const lowerThreshold = Number(labels[LOWER_THRESHOLD]) || 25; // limit to reach before scaling DOWN
        const upperThreshold = Number(labels[UPPER_THRESHOLD]) || 85; // limit to reach before scaling UP

        const minCount = Number(labels[MIN_LABEL]);
        const maxCount = Number(labels[MAX_LABEL]);

        if (lowerThreshold < metric && currentReplicaCount > minCount) {
          // scale down
          this.docker.scaleService(serviceName, currentReplicaCount - 1);
        }

        if (upperThreshold < metric && currentReplicaCount < maxCount) {
          // scale up
          this.docker.scaleService(serviceName, currentReplicaCount + 1);
        }

        console.log();

        console.log(singleMetric, labels, service[0].Spec.Mode);
        //
        return service;
      }),
    );
  }
}

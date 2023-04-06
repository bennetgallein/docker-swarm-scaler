import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Docker from 'dockerode';
import { ASSUME_LABEL } from 'src/constants';

@Injectable()
export class DockerService {
  private service: Docker;
  constructor(private readonly config: ConfigService) {
    this.service = new Docker({ socketPath: '/var/run/docker.sock' });
  }

  /**
   * scale a service to x replicas by either providing the ID or the name
   *
   * @param target id or name of the service to scale
   * @param count target count of the service
   * @returns something
   */
  public async scaleService(target: string, count: number) {
    const service = await this.getService(target);

    const result = await this.service.getService(service[0].ID).update({
      version: service[0].Version.Index,
      ...service[0].Spec,
      Mode: {
        Replicated: {
          Replicas: count,
        },
      },
    });
    //
    return result;
  }

  public async getServices(targetLabel: string) {
    const result = await this.service.listServices({
      filters: JSON.stringify({
        label: {
          [targetLabel]: true,
        },
      }),
    });
    return result;
  }

  /**
   * return a service by the name
   *
   * @param name the name to search for
   * @returns
   */
  public async getService(name: string) {
    return this.service.listServices({
      filters: {
        name: [name],
        label: [ASSUME_LABEL],
      },
    });
  }
}

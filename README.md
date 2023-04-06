## Docker Swarm Scaler

Docker Swarm Scaler is a project that aims to provide an easy way to auto-scale docker swarm services based on external metrics.

### Usage

See `test-stack.yml` for an example-stack. You will need prometheus and cadvisor in order to collect the metrics.

Example compose part:

```yml
scale-service:
  image: ghcr.io/bennetgallein/docker-swarm-scaler-backend:main
  init: true
  volumes:
    - /var/run/docker.sock:/var/run/docker.sock:ro
  environment:
    - PROM_URL=prometheus
    - PROM_PORT=9090
  deploy:
    mode: replicated
    replicas: 1
    placement:
      constraints:
        - node.role == manager
```

To enable auto-scaling, use the following labels on a service:

| name                               | value   | description                                                                                                    |
| ---------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| balancer.enable                    | Boolean | basic toggle wether to enable or disable balancing                                                             |
| balancer.scale.min.count           | Number  | the minimal number of containers that need to be kept. Scaling wont happen below this number                   |
| balancer.scale.max.count           | Number  | the maximal number of containers that are allowed to run. Scaling up won't happen after this number is reached |
| balancer.scale.threshold.cpu.lower | Number  | the lower cpu-usage threshold that needs to be crossed before a service is considered to be scaled down.       |
| balancer.scale.threshold.cpu.upper | Number  | the cpu-usage threshold that needs to be crossed before a container will be considered to be scaled up.        |

### Issues & Feature Requests

Please open a new [Issue](https://github.com/bennetgallein/docker-swarm-scaler/issues/new) and describe what you want.

### Roadmap / Planned Features

- [ ] RAM based scaling strategy
- [ ] Enable the usage of other/external metrics (like req/s for Webservices, queries/s for databases, etc.)
- [ ] task scaling history log
- [ ] basic webinterface to understand scaling history & manipulate current scale-count

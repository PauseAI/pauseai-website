# PauseAI Site Helm Chart

Deploy the PauseAI Spanish website to Kubernetes as a Node-based web service.

## Prerequisites

- Kubernetes 1.33 or newer
- Helm 3.12+
- Container image pushed to a registry accessible by your cluster

## Installing the Chart

```bash
helm upgrade --install pauseai-es charts/pauseai-website-es \
  --set image.repository=<your-image> \
  --set image.tag=<your-tag>
```

## Configuration

| Key                  | Default                    | Description                                             |
| -------------------- | -------------------------- | ------------------------------------------------------- |
| `replicaCount`       | `1`                        | Number of pods                                          |
| `image.repository`   | ``                         | OCI image to deploy                                     |
| `image.tag`          | `""` (Chart appVersion)    | Image tag                                               |
| `service.port`       | `80`                       | Cluster service port                                    |
| `service.targetPort` | `3000`                     | Container port exposed by the Node adapter              |
| `ingress.enabled`    | `false`                    | Enable Ingress resource                                 |
| `env`                | Spanish-localized defaults | Extra environment variables injected into the container |

See `values.yaml` for an exhaustive list.

## Local Testing

```bash
helm template pauseai-es charts/pauseai-website-es --set image.tag=latest
```

## Notes

- The chart expects the workload to listen on port `3000` (matching `CMD ["node", "build"]` in the Dockerfile).
- Default resources are modest; adjust `values.yaml` to match your capacity planning.

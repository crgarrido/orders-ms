# Orders Microservices

```
docker-compose up -d
```

```
docker buildx build --platform linux/amd64 -t 5.161.60.147:5000/orders-ms:latest -f dockerfile.prod .
docker push 5.161.60.147:5000/orders-ms:latest
```

docker compose -f docker-compose.yaml down
docker compose -f docker-compose.yaml build --no-cache nextjs-app api-server
docker compose -f docker-compose.yaml up -d
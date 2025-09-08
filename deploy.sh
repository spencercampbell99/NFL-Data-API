docker-compose -f docker-compose.production.yaml down
docker-compose -f docker-compose.production.yaml build --no-cache nextjs-app api-server
docker-compose -f docker-compose.production.yaml up -d
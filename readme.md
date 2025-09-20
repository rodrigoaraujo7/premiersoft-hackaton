# Hackathon

## Docker settings - Postgres

#### Build (geração) da imagem do docker

````bash
docker-compose build
````

````bash
docker-compose up
````

#### Conferir se está rodando

```` bash
docker ps
````

```` bash
docker logs <CONTAINER_ID>
````

#### Teste da base!

```` bash
docker exec postgres_db psql -U postgres -d hackathon -c "SELECT 1;"
````
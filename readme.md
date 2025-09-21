-- Improved compatibility of Voltar pro topo link -->
<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/rodrigoaraujo7/premiersoft-hackaton">
    <img width="822" height="841" alt="EstruturaGeraldodocker drawio (1)" src="https://github.com/user-attachments/assets/8adaa41e-dd64-46be-b4a6-b894547f9cbd" />



  </a>

  <h3 align="center">Premiersoft Hackaton</h3>

  <p align="center">
    Projeto de hackathon colaborativo com backend, frontend e pipelines de dados. <br/>
    Apresentando configuração Dockerizada do Postgres, visualizações de gráficos e utilitários Python.
  </p>
</div>

## Sobre o Projeto

O Premiersoft Hackaton é um projeto colaborativo que integra diversos serviços:

- Serviços de back-end para processamento de dados
- Painéis de front-end com gráficos
- Postgres Dockerizado para persistência
- Utilitários Python e scripts de migração
<p align="right">(<a href="#readme-top">Voltar pro topo</a>)</p>

### Recursos

- Banco de dados PostgreSQL em contêiner com Docker Compose
- Migrações automatizadas para configuração de banco de dados
- Configurações de gráficos em várias páginas (frontend)
- Utilitários Python para processamento e migração de dados
- Base de código colaborativa e multilíngue (TS, JS, Python, CSS)
  
### Construido com

- [![TypeScript][TS-badge]][TS-url]
- [![Python][Python-badge]][Python-url]
- [![Postgres][Postgres-badge]][Postgres-url]
- [![Docker][Docker-badge]][Docker-url]

## Começando

### Prerequisitos

- Node.js 22
- npm 10
- Docker & Docker Compose

### Instalação

1. Clone the repo
   ```sh
   git clone https://github.com/rodrigoaraujo7/premiersoft-hackaton.git
   cd premiersoft-hackaton
   ```
2. Install dependencies (for frontend/backend)
   ```sh
   npm install
   ```

### Docker Setup

Rode Postgres com docker compose:

```sh
docker-compose build
docker-compose up
```

checar se esta funcionando:
```sh
docker ps
docker logs <CONTAINER_ID>
```

Testar a conexão do DB:
```sh
docker exec postgres_db psql -U postgres -d hackathon -c "SELECT 1;"
```

Migrar DB:
```sh
docker-compose down -v
docker-compose build
docker-compose up
```

## Usagem

- Rodar os serviços backend com `npm run dev`
- Acesse os Graficos do frontend em `http://localhost:3000`
- Gerencie DB com `psql` dentro do container do Docker

See the [open issues](https://github.com/rodrigoaraujo7/premiersoft-hackaton/issues) for more.



## Licensa

Distributed under the MIT License. See `LICENSE` for details.


## Conhecimentos

- [Docker](https://www.docker.com)
- [Postgres](https://www.postgresql.org)
- [Node.js](https://nodejs.org)
- [Premiersoft Hackaton Contributors](https://github.com/rodrigoaraujo7/premiersoft-hackaton/graphs/contributors)

<p align="right">(<a href="#readme-top">Voltar pro topo</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[TS-badge]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[TS-url]: https://www.typescriptlang.org/
[Python-badge]: https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white
[Python-url]: https://www.python.org/
[Postgres-badge]: https://img.shields.io/badge/Postgres-316192?style=for-the-badge&logo=postgresql&logoColor=white
[Postgres-url]: https://www.postgresql.org/
[Docker-badge]: https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white
[Docker-url]: https://www.docker.com


<!-- Improved compatibility of back to top link -->
<a id="readme-top"></a>

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/rodrigoaraujo7/premiersoft-hackaton">
    <img src="public/logonew/logo.png" alt="Logo" width="96" height="96">
  </a>

  <h3 align="center">Premiersoft Hackaton</h3>

  <p align="center">
    Collaborative hackathon project with backend, frontend, and data pipelines. <br/>
    Featuring Dockerized Postgres setup, chart visualizations, and Python utilities.
    <br />
    <a href="https://github.com/rodrigoaraujo7/premiersoft-hackaton"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/rodrigoaraujo7/premiersoft-hackaton">View Repo</a>
    &middot;
    <a href="https://github.com/rodrigoaraujo7/premiersoft-hackaton/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/rodrigoaraujo7/premiersoft-hackaton/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#features">Features</a></li>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#docker-setup">Docker Setup</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

## About The Project

Premiersoft Hackaton is a collaborative project that integrates multiple services:

- Backend services for data processing
- Frontend dashboards with charts
- Dockerized Postgres for persistence
- Python utilities and migration scripts

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Features

- PostgreSQL database containerized with Docker Compose
- Automated migrations for database setup
- Chart configurations across multiple pages (frontend)
- Python utilities for data processing and migration
- Collaborative, multi-language codebase (TS, JS, Python, CSS)

### Built With

- [![TypeScript][TS-badge]][TS-url]
- [![Python][Python-badge]][Python-url]
- [![Postgres][Postgres-badge]][Postgres-url]
- [![Docker][Docker-badge]][Docker-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Docker & Docker Compose

### Installation

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

Run Postgres with Docker Compose:

```sh
docker-compose build
docker-compose up
```

Check if it’s running:
```sh
docker ps
docker logs <CONTAINER_ID>
```

Test DB connection:
```sh
docker exec postgres_db psql -U postgres -d hackathon -c "SELECT 1;"
```

Migrate databases:
```sh
docker-compose down -v
docker-compose build
docker-compose up
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Usage

- Run backend services with `npm run dev`
- Access frontend charts at `http://localhost:3000`
- Manage DB with `psql` inside Docker container

<p align="right">(<a href="#readme-top">back to top</a>)</p>

See the [open issues](https://github.com/rodrigoaraujo7/premiersoft-hackaton/issues) for more.

<p align="right">(<a href="#readme-top">back to top</a>)</p>


## License

Distributed under the MIT License. See `LICENSE` for details.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Acknowledgments

- [Docker](https://www.docker.com)
- [Postgres](https://www.postgresql.org)
- [Node.js](https://nodejs.org)
- [Premiersoft Hackaton Contributors](https://github.com/rodrigoaraujo7/premiersoft-hackaton/graphs/contributors)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
[TS-badge]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[TS-url]: https://www.typescriptlang.org/
[Python-badge]: https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white
[Python-url]: https://www.python.org/
[Postgres-badge]: https://img.shields.io/badge/Postgres-316192?style=for-the-badge&logo=postgresql&logoColor=white
[Postgres-url]: https://www.postgresql.org/
[Docker-badge]: https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white
[Docker-url]: https://www.docker.com


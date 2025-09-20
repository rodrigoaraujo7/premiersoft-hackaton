# Dockerfile para PostgreSQL
FROM postgres:15-alpine

# Variáveis de ambiente para configuração inicial
ENV POSTGRES_DB=hackathon
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres

# Cria diretório para scripts de inicialização
COPY migration/ /docker-entrypoint-initdb.d/

# Expor a porta padrão do PostgreSQL
EXPOSE 5432

# Configurações adicionais do PostgreSQL (opcional)
RUN echo "shared_preload_libraries = 'pg_stat_statements'" >> /usr/local/share/postgresql/postgresql.conf.sample
RUN echo "pg_stat_statements.track = all" >> /usr/local/share/postgresql/postgresql.conf.sample

# Volume para persistência dos dados
VOLUME ["/var/lib/postgresql/data"]
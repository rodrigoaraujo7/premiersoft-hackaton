--- Criação da tabela estados
CREATE TABLE if NOT EXISTS estados (
  codigo_uf SMALLINT PRIMARY KEY,
  sigla_uf TEXT,
  nome_estado TEXT,
  latitude DECIMAL(9,6),
  longitude DECIMAL(9,6),
  regiao_nome TEXT
);

-- Criação da tabela hospitais
CREATE TABLE if NOT EXISTS hospitais (
  codigo UUID PRIMARY KEY,
  nome TEXT,
  cod_municipio TEXT,
  bairro TEXT,
  especialidades TEXT
);

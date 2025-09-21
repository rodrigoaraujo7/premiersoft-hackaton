-- Criação da tabela hospitais
CREATE TABLE IF NOT EXISTS hospitais (
  codigo UUID PRIMARY KEY,
  nome TEXT NULL,
  cod_municipio TEXT NULL,
  bairro TEXT NULL,
  especialidades TEXT NULL,
  leitos INT NULL
);


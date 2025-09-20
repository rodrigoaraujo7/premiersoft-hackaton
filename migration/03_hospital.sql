
-- Criação da tabela hospitais
CREATE TABLE IF NOT EXISTS hospitais (
  codigo UUID PRIMARY KEY,
  nome TEXT,
  cod_municipio TEXT,
  bairro TEXT,
  especialidades TEXT
);

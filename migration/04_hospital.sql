-- Criação da tabela hospitais
CREATE TABLE IF NOT EXISTS hospitais (
  codigo UUID PRIMARY KEY,
  nome TEXT NULL,
  cod_municipio TEXT NULL,
  bairro TEXT NULL,
  especialidades TEXT NULL,
  leitos INT NULL
);

-- Adicionar foreign key separadamente para evitar problemas com dados nulos
ALTER TABLE hospitais ADD CONSTRAINT fk_hospitais_municipio
FOREIGN KEY (cod_municipio) REFERENCES municipios(codigo_ibge);


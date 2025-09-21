-- Criação da tabela hospitais
CREATE TABLE IF NOT EXISTS hospitais (
  codigo UUID PRIMARY KEY,
  nome TEXT,
  cod_municipio UUID,
  bairro TEXT,
  especialidades TEXT,
  leitos INT,
  FOREIGN KEY (cod_municipio) REFERENCES municipios(codigo_ibge)
);

